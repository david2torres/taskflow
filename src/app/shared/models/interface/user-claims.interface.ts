export interface UserClaims {
    sub: string;
    email: string;
    name: string;
    roles: string[];
    exp: number;
}
