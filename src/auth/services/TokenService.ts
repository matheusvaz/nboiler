import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { RefreshTokenCommand } from '@src/auth/commands/RefreshTokenCommand';
import { User } from '@src/auth/entities/User';
import { TokenFactory } from '@src/auth/factories/TokenFactory';
import { Token } from '@src/auth/models/Token';
import { UserRepository } from '@src/auth/repositories/UserRepository';
import { TokenInfo } from '@src/shared/models/TokenInfo';
import { TokenType } from '@src/shared/models/TokenType';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import { Crypto } from '@src/shared/services/Crypto';

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly cache: CacheAdapter,
        private readonly tokenFactory: TokenFactory,
    ) {}

    public async issue(command: IssueTokenCommand): Promise<Token> {
        const user = await this.userRepository.findByEmail(command.email);

        if (
            !user ||
            !(await Crypto.passwordHashVerify(user.password, command.password))
        ) {
            throw new UnauthorizedException();
        }

        return await this.generateToken(user);
    }

    public async refresh(command: RefreshTokenCommand): Promise<Token> {
        const rTokenHash = await Crypto.genericHash(command.refreshToken);
        const rTokenInfo = await this.cache.get<TokenInfo>(rTokenHash);

        if (!rTokenInfo) {
            throw new UnauthorizedException();
        }

        if (rTokenInfo.type !== TokenType.Refresh) {
            throw new UnauthorizedException();
        }

        const aTokenInfo = await this.cache.get<TokenInfo>(rTokenInfo.pair);

        if (aTokenInfo) {
            await this.cache.remove(rTokenInfo.pair);
        }

        await this.cache.remove(rTokenHash);

        const user = await this.userRepository.findById(rTokenInfo.userId);

        return this.generateToken(user);
    }

    public async destroy(accessToken: string): Promise<void> {
        const aTokenInfo = await this.cache.get<TokenInfo>(accessToken);

        await this.cache.remove(accessToken);
        await this.cache.remove(aTokenInfo.pair);
    }

    private async generateToken(user: User): Promise<Token> {
        const pair = await this.tokenFactory.create(user);

        await this.cache.set(
            pair.accessToken.hash,
            pair.accessToken.info,
            pair.accessToken.info.duration,
        );

        await this.cache.set(
            pair.refreshToken.hash,
            pair.refreshToken.info,
            pair.refreshToken.info.duration,
        );

        return {
            accessToken: {
                token: pair.accessToken.token,
                expiry: pair.accessToken.info.expiry,
            },

            refreshToken: {
                token: pair.refreshToken.token,
                expiry: pair.refreshToken.info.expiry,
            },
        };
    }
}
