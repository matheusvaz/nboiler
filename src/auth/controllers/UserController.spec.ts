import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordCommand } from '@src/auth/commands/ChangePasswordCommand';
import { CheckPasswordRecoveryTokenCommand } from '@src/auth/commands/CheckPasswordRecoveryTokenCommand';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { IssuePasswordRecoverTokenCommand } from '@src/auth/commands/IssuePasswordRecoverTokenCommand';
import { UserController } from '@src/auth/controllers/UserController';
import { UserService } from '@src/auth/services/UserService';
import { AuthenticationRequired } from '@src/shared/guards/AuthenticationRequired';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import faker from 'faker';

jest.mock('@src/auth/services/UserService');
jest.mock('@src/auth/commands/CreateUserCommand');
jest.mock('@src/auth/commands/IssuePasswordRecoverTokenCommand');
jest.mock('@src/auth/commands/ChangePasswordCommand');
jest.mock('@src/auth/commands/CheckPasswordRecoveryTokenCommand');

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService, CacheAdapter, AuthenticationRequired],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
        expect(userService).toBeDefined();
    });

    describe('create', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new CreateUserCommand();
            command.email = faker.internet.email();
            command.name = faker.name.firstName();
            command.password = faker.internet.password(6);

            const spy = jest.spyOn(userService, 'create');

            // Act
            await controller.create(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });

    describe('profile', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const request = { userId: faker.random.alphaNumeric(32) };
            const spy = jest.spyOn(userService, 'getProfile');

            // Act
            await controller.profile(request);

            // Assert
            expect(spy).toHaveBeenCalledWith(request.userId);
        });
    });

    describe('recoverPassword', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = faker.internet.email();

            const spy = jest.spyOn(userService, 'issuePasswordRecoverToken');

            // Act
            await controller.recoverPassword(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });

    describe('changePassword', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new ChangePasswordCommand();
            command.password = faker.internet.password(6);
            command.token = faker.random.alphaNumeric(32);

            const spy = jest.spyOn(userService, 'changePassword');

            // Act
            await controller.changePassword(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });

    describe('checkPasswordRecoveryToken', () => {
        it('should call service method with correct args', async () => {
            // Arrange
            const command = new CheckPasswordRecoveryTokenCommand();
            command.token = faker.random.alphaNumeric(32);

            const spy = jest.spyOn(userService, 'checkPasswordRecoveryToken');

            // Act
            await controller.checkPasswordRecoveryToken(command);

            // Assert
            expect(spy).toHaveBeenCalledWith(command);
        });
    });
});
