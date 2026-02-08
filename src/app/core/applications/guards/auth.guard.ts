import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../infrastructure/auth/auth.service';


export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.getToken() || auth.isTokenExpired()) {
        auth.logout();
        router.navigate(['/login']);
        return false;
    }

    return true;
};
