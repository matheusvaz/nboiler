import { Injectable } from '@nestjs/common';
import { User } from '@src/auth/entities/User';
import { TokenInfo } from '@src/shared/models/TokenInfo';
import { TokenPair } from '@src/shared/models/TokenPair';
import { TokenType } from '@src/shared/models/TokenType';
import { Crypto } from '@src/shared/services/Crypto';
import moment = require('moment');

@Injectable()
export class TokenFactory {
    public async create(user: User): Promise<TokenPair> {
        const aToken = await Crypto.token();
        const aTokenHash = await Crypto.genericHash(aToken);
        const rToken = await Crypto.token();
        const rTokenHash = await Crypto.genericHash(rToken);
        const aTokenInfo = this.tInfo(TokenType.Access, user.id, rTokenHash);
        const rTokenInfo = this.tInfo(TokenType.Refresh, user.id, aTokenHash);

        return {
            accessToken: {
                token: aToken,
                hash: aTokenHash,
                info: aTokenInfo,
            },

            refreshToken: {
                token: rToken,
                hash: rTokenHash,
                info: rTokenInfo,
            },
        };
    }

    private tInfo(type: TokenType, userId: string, pair: string): TokenInfo {
        return {
            userId,
            type,
            pair,
            expiry:
                type === TokenType.Access
                    ? moment()
                          .add('1', 'hour')
                          .utc()
                          .toDate()
                    : moment()
                          .add('30', 'days')
                          .utc()
                          .toDate(),
            duration:
                type === TokenType.Access
                    ? moment.duration(1, 'hour').asSeconds()
                    : moment.duration(30, 'days').asSeconds(),
        };
    }
}
