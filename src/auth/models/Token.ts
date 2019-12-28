export interface Token {
    accessToken: {
        token: string;
        expiry: Date;
    };
    refreshToken: { token: string; expiry: Date };
}
