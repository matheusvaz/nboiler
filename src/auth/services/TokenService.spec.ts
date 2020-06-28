import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { RefreshTokenCommand } from '@src/auth/commands/RefreshTokenCommand';
import { User } from '@src/auth/entities/User';
import { TokenFactory } from '@src/auth/factories/TokenFactory';
import { UserRepository } from '@src/auth/repositories/UserRepository';
import { TokenService } from '@src/auth/services/TokenService';
import { TokenInfo } from '@src/shared/models/TokenInfo';
import { TokenPair } from '@src/shared/models/TokenPair';
import { TokenType } from '@src/shared/models/TokenType';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import { Crypto } from '@src/shared/services/Crypto';
import faker from 'faker';

jest.mock('@src/auth/repositories/UserRepository');
jest.mock('@src/auth/factories/TokenFactory');

describe('TokenService', () => {
    let tokenService: TokenService;
    let userRepository: UserRepository;
    let tokenFactory: TokenFactory;
    let cache: CacheAdapter;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenService, UserRepository, CacheAdapter, TokenFactory],
        }).compile();

        tokenService = module.get<TokenService>(TokenService);
        userRepository = module.get<UserRepository>(UserRepository);
        tokenFactory = module.get<TokenFactory>(TokenFactory);
        cache = module.get<CacheAdapter>(CacheAdapter);
    });

    it('should be defined', () => {
        expect(tokenService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(tokenFactory).toBeDefined();
    });

    describe('issue', () => {
        it('should throw UnauthorizedException when user was not found', async () => {
            // Arrange
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(() => Promise.resolve(null));

            // Act
            const findByEmail = async (): Promise<void> => {
                await tokenService.issue(command);
            };

            // Assert
            await expect(findByEmail()).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when password does not match', async () => {
            // Arrange
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(async () =>
                Promise.resolve({
                    password: await Crypto.passwordHash(faker.internet.password(8)),
                } as User),
            );

            // Act
            const findByEmail = async (): Promise<void> => {
                await tokenService.issue(command);
            };

            // Assert
            await expect(findByEmail()).rejects.toThrow(UnauthorizedException);
        });

        it('should issue token when user was found and password match', async () => {
            // Arrange
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            const passwordHash = await Crypto.passwordHash(command.password);
            const token = await Crypto.token();

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(async () =>
                Promise.resolve({
                    password: await Crypto.passwordHash(command.password),
                } as User),
            );

            jest.spyOn(tokenFactory, 'create').mockImplementation(() =>
                Promise.resolve({
                    accessToken: {
                        hash: passwordHash,
                        info: {},
                        token: token,
                    },

                    refreshToken: {
                        hash: passwordHash,
                        info: {},
                        token: token,
                    },
                } as TokenPair),
            );

            // Act
            const result = await tokenService.issue(command);

            // Assert
            await expect(result).toBeDefined();
        });
    });

    describe('destroy', () => {
        it('should remove access token from cache', async () => {
            // Arrange
            const accessToken = await Crypto.token();

            const spyCacheGet = jest.spyOn(cache, 'get').mockImplementation(() => Promise.resolve({} as TokenInfo));

            const spyCacheRemove = jest.spyOn(cache, 'remove').mockImplementation(() => Promise.resolve(null));

            // Act
            await tokenService.destroy(accessToken);

            // Assert
            expect(spyCacheGet).toBeCalledWith(accessToken);
            expect(spyCacheRemove).toBeCalledTimes(2);
        });
    });

    describe('refresh', () => {
        it('should throw UnauthorizedException when token is not found', async () => {
            // Arrange
            const command = new RefreshTokenCommand();
            command.refreshToken = await Crypto.token();

            jest.spyOn(cache, 'get').mockImplementation(() => Promise.resolve(null));

            // Act
            const refresh = async (): Promise<void> => {
                await tokenService.refresh(command);
            };

            // Assert
            await expect(refresh()).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException when token is not refresh token', async () => {
            // Arrange
            const command = new RefreshTokenCommand();
            command.refreshToken = await Crypto.token();

            jest.spyOn(cache, 'get').mockImplementation(() => Promise.resolve({ type: TokenType.Access } as TokenInfo));

            // Act
            const refresh = async (): Promise<void> => {
                await tokenService.refresh(command);
            };

            // Assert
            await expect(refresh()).rejects.toThrow(UnauthorizedException);
        });

        it('should remove token pair if exists', async () => {
            // Arrange
            const command = new RefreshTokenCommand();
            command.refreshToken = await Crypto.token();

            jest.spyOn(cache, 'get').mockImplementation(() =>
                Promise.resolve({
                    type: TokenType.Refresh,
                    pair: command.refreshToken,
                } as TokenInfo),
            );

            const spy = jest.spyOn(cache, 'remove').mockImplementation(() => Promise.resolve(null));

            // Act
            await tokenService.refresh(command);

            // Assert
            expect(spy).toBeCalled();
        });
    });
});
