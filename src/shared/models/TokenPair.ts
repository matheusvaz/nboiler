import { TokenInfo } from '@src/shared/models/TokenInfo';

export interface TokenPair {
    accessToken: {
        token: string;
        hash: string;
        info: TokenInfo;
    };

    refreshToken: {
        token: string;
        hash: string;
        info: TokenInfo;
    };
}
