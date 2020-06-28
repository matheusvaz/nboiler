import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenInfo } from '@src/shared/models/TokenInfo';
import { TokenType } from '@src/shared/models/TokenType';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import { Crypto } from '@src/shared/services/Crypto';

@Injectable()
export class AuthenticationRequired implements CanActivate {
    constructor(private readonly cache: CacheAdapter) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization;

        if (!token) {
            throw new UnauthorizedException();
        }

        const hashedToken = await Crypto.genericHash(token);
        const tokenInfo = await this.cache.get<TokenInfo>(hashedToken);

        if (!tokenInfo) {
            throw new UnauthorizedException();
        }

        if (tokenInfo.type === TokenType.Refresh) {
            throw new UnauthorizedException();
        }

        request.userId = tokenInfo.userId;
        request.accessToken = hashedToken;

        return true;
    }
}
