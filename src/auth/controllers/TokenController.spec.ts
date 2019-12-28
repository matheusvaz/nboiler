import { Test, TestingModule } from '@nestjs/testing';
import { IssueTokenCommand } from '@src/auth/commands/IssueTokenCommand';
import { RefreshTokenCommand } from '@src/auth/commands/RefreshTokenCommand';
import { TokenController } from '@src/auth/controllers/TokenController';
import { TokenService } from '@src/auth/services/TokenService';
import { AuthenticationRequired } from '@src/shared/guards/AuthenticationRequired';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import { Translation } from '@src/shared/services/Translation';
import faker from 'faker';

jest.mock('@src/auth/services/TokenService');
jest.mock('@src/auth/commands/IssueTokenCommand');
jest.mock('@src/auth/commands/RefreshTokenCommand');

describe('TokenController', () => {
    let controller: TokenController;
    let tokenService: TokenService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TokenController],
            providers: [
                TokenService,
                CacheAdapter,
                AuthenticationRequired,
                Translation,
            ],
        }).compile();

        controller = module.get<TokenController>(TokenController);
        tokenService = module.get<TokenService>(TokenService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(tokenService).toBeDefined();
    });

    describe('issue', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new IssueTokenCommand();
            command.email = faker.internet.email();
            command.password = faker.internet.password(6);

            const spy = jest.spyOn(tokenService, 'issue');

            // Act
            await controller.issue(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });

    describe('refresh', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new RefreshTokenCommand();
            command.refreshToken = faker.random.alphaNumeric(32);

            const spy = jest.spyOn(tokenService, 'refresh');

            // Act
            await controller.refresh(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });

    describe('destroy', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const request = { accessToken: faker.random.alphaNumeric(32) };
            const spy = jest.spyOn(tokenService, 'destroy');

            // Act
            await controller.destroy(request);

            // Assert
            expect(spy).toHaveBeenCalledWith(request.accessToken);
        });
    });
});
