import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserClaims } from '../../../shared/models/interface/user-claims.interface';

const TOKEN_KEY = 'taskflow_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly router = inject(Router);

    private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasValidToken());
    readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

    login(email: string, _password: string): Observable<boolean> {
        const nowSec = Math.floor(Date.now() / 1000);

        const claims: UserClaims = {
            sub: (crypto?.randomUUID?.() ?? String(Date.now())),
            email,
            name: email.split('@')[0] || 'User',
            roles: ['user'],
            exp: nowSec + 30 * 60,
        };

        const token = this.createFakeJwt(claims);
        localStorage.setItem(TOKEN_KEY, token);
        this._isAuthenticated$.next(true);

        return of(true);
    }

    logout(): void {
        localStorage.removeItem(TOKEN_KEY);
        this._isAuthenticated$.next(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    decodeToken(): UserClaims | null {
        const token = this.getToken();
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length < 2) return null;

        try {
            const payloadJson = this.base64UrlDecode(parts[1]);
            const payload = JSON.parse(payloadJson) as UserClaims;
            return payload?.exp ? payload : null;
        } catch {
            return null;
        }
    }

    isTokenExpired(): boolean {
        const claims = this.decodeToken();
        if (!claims) return true;
        const nowSec = Math.floor(Date.now() / 1000);
        return claims.exp <= nowSec;
    }

    hasValidToken(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired();
    }

    private createFakeJwt(payload: UserClaims): string {
        const header = { alg: 'none', typ: 'JWT' };
        const encHeader = this.base64UrlEncode(JSON.stringify(header));
        const encPayload = this.base64UrlEncode(JSON.stringify(payload));
        return `${encHeader}.${encPayload}.`;
    }

    private base64UrlEncode(str: string): string {
        return btoa(unescape(encodeURIComponent(str)))
            .replaceAll('+', '-')
            .replaceAll('/', '_')
            .replaceAll('=', '');
    }

    private base64UrlDecode(str: string): string {
        const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
        const b64 = (str + pad).replaceAll('-', '+').replaceAll('_', '/');
        return decodeURIComponent(escape(atob(b64)));
    }
}
