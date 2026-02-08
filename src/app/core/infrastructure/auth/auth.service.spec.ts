import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideRouter([])],
        });
        service = TestBed.inject(AuthService);
    });

    it('login should store token in localStorage', (done) => {
        spyOn(localStorage, 'setItem').and.callFake(() => { });
        service.login('test@email.com', '123').subscribe({
            next: () => {
                expect(localStorage.setItem).toHaveBeenCalled();
                done();
            }
        });
    });

    it('logout should clear token and set auth state false', () => {
        spyOn(localStorage, 'removeItem').and.callFake(() => { });
        service.logout();
        expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('isAuthenticated$ should emit true after login', (done) => {
        const sub = service.isAuthenticated$.subscribe((isAuth) => {
            if (isAuth === true) {
                sub.unsubscribe();
                done();
            }
        });
        service.login('user@email.com', 'pw').subscribe();
    });
});
