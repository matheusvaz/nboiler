import { TokenType } from '@src/shared/models/TokenType';

export interface TokenInfo {
    userId: string;
    type: TokenType;
    pair: string;
    expiry: Date;
    duration: number;
}
