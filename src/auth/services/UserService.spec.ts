import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChangePasswordCommand } from '@src/auth/commands/ChangePasswordCommand';
import { CheckPasswordRecoveryTokenCommand } from '@src/auth/commands/CheckPasswordRecoveryTokenCommand';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { IssuePasswordRecoverTokenCommand } from '@src/auth/commands/IssuePasswordRecoverTokenCommand';
import { PasswordReset } from '@src/auth/entities/PasswordReset';
import { User } from '@src/auth/entities/User';
import { UserFactory } from '@src/auth/factories/UserFactory';
import { Profile } from '@src/auth/models/Profile';
import { PasswordResetRepository } from '@src/auth/repositories/PasswordResetRepository';
import { UserRepository } from '@src/auth/repositories/UserRepository';
import { UserService } from '@src/auth/services/UserService';
import { Transaction } from '@src/shared/helpers/Transaction';
import faker from 'faker';

jest.mock('@src/auth/repositories/UserRepository');
jest.mock('@src/auth/repositories/PasswordResetRepository');
jest.mock('@src/shared/helpers/Transaction');

describe('UserService', () => {
    let userService: UserService;
    let userRepository: UserRepository;
    let userFactory: UserFactory;
    let passwordResetRepository: PasswordResetRepository;
    let transaction: Transaction;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                UserRepository,
                UserFactory,
                PasswordResetRepository,
                Transaction,
            ],
        }).compile();

        userService = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
        userFactory = module.get<UserFactory>(UserFactory);
        passwordResetRepository = module.get<PasswordResetRepository>(
            PasswordResetRepository,
        );
        transaction = module.get<Transaction>(Transaction);
    });

    it('should be defined', () => {
        expect(userService).toBeDefined();
        expect(userRepository).toBeDefined();
        expect(userFactory).toBeDefined();
        expect(passwordResetRepository).toBeDefined();
        expect(transaction).toBeDefined();
    });

    describe('getProfile', () => {
        it('should throw NotFoundException if no user is found', async () => {
            // Arrange
            const id = faker.random.alphaNumeric();
            jest.spyOn(userRepository, 'findById').mockImplementation(() =>
                Promise.resolve(null),
            );

            // Act
            const getProfile = async (): Promise<void> => {
                await userService.getProfile(id);
            };

            // Assert
            await expect(getProfile()).rejects.toThrow(NotFoundException);
        });

        it('should return user profile', async () => {
            // Arrange
            const payload: Profile = {
                id: faker.random.alphaNumeric(),
                email: faker.internet.email(),
                name: faker.name.firstName(),
            };

            jest.spyOn(userRepository, 'findById').mockImplementation(() =>
                Promise.resolve(payload as User),
            );

            // Act
            const profile = await userService.getProfile(payload.id);

            // Assert
            expect(profile).toStrictEqual(payload);
        });
    });

    describe('create', () => {
        it('should not create user when user already exists', async () => {
            // Arrange
            const command = new CreateUserCommand();
            command.email = faker.internet.email();
            command.name = faker.name.firstName();
            command.password = faker.internet.password(6);

            jest.spyOn(userFactory, 'create').mockImplementation(() =>
                Promise.resolve(command as User),
            );

            jest.spyOn(userRepository, 'exists').mockImplementation(() =>
                Promise.resolve(true),
            );

            const spy = jest
                .spyOn(userRepository, 'save')
                .mockImplementation(() => Promise.resolve(null));

            // Act
            await userService.create(command);

            // Assert
            expect(spy).not.toHaveBeenCalled();
        });

        it('should create user when user does not exist', async () => {
            // Arrange
            const command = new CreateUserCommand();
            command.email = faker.internet.email();
            command.name = faker.name.firstName();
            command.password = faker.internet.password(6);

            jest.spyOn(userFactory, 'create').mockImplementation(() =>
                Promise.resolve(command as User),
            );

            jest.spyOn(userRepository, 'exists').mockImplementation(() =>
                Promise.resolve(false),
            );

            const spy = jest
                .spyOn(userRepository, 'save')
                .mockImplementation(() => Promise.resolve(null));

            // Act
            await userService.create(command);

            // Assert
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('issuePasswordRecoverToken', () => {
        it('should not issue password reset token when user does not exist', async () => {
            // Arrange
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = faker.internet.email();

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(() =>
                Promise.resolve(null),
            );

            const spy = jest
                .spyOn(passwordResetRepository, 'save')
                .mockImplementation(() => Promise.resolve(null));

            // Act
            await userService.issuePasswordRecoverToken(command);

            // Assert
            expect(spy).not.toHaveBeenCalled();
        });

        it('should not reissue password reset token when already exists', async () => {
            // Arrange
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = faker.internet.email();

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(() =>
                Promise.resolve(command as User),
            );

            jest.spyOn(
                passwordResetRepository,
                'findByUserId',
            ).mockImplementation(() => Promise.resolve({} as PasswordReset));

            const passwordResetSaveSpy = jest
                .spyOn(passwordResetRepository, 'save')
                .mockImplementation(() => Promise.resolve(null));

            // Act
            await userService.issuePasswordRecoverToken(command);

            // Assert
            expect(passwordResetSaveSpy).not.toHaveBeenCalled();
        });

        it('should issue password reset token when does not exists', async () => {
            // Arrange
            const command = new IssuePasswordRecoverTokenCommand();
            command.email = faker.internet.email();

            jest.spyOn(userRepository, 'findByEmail').mockImplementation(() =>
                Promise.resolve(command as User),
            );

            jest.spyOn(
                passwordResetRepository,
                'findByUserId',
            ).mockImplementation(() => Promise.resolve(null));

            const passwordResetSaveSpy = jest
                .spyOn(passwordResetRepository, 'save')
                .mockImplementation(() => Promise.resolve(null));

            // Act
            await userService.issuePasswordRecoverToken(command);

            // Assert
            expect(passwordResetSaveSpy).toHaveBeenCalled();
        });
    });

    describe('checkPasswordRecoveryToken', () => {
        it('should throw NotFoundException when password reset token does not exist', async () => {
            // Arrange
            const command = new CheckPasswordRecoveryTokenCommand();
            command.token = faker.random.alphaNumeric();

            jest.spyOn(
                passwordResetRepository,
                'findByToken',
            ).mockImplementation(() => Promise.resolve(null));

            // Act
            const checkPasswordRecoveryToken = async (): Promise<void> => {
                await userService.checkPasswordRecoveryToken(command);
            };

            // Assert
            await expect(checkPasswordRecoveryToken()).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should not throw when password reset token exists', async () => {
            // Arrange
            const command = new CheckPasswordRecoveryTokenCommand();
            command.token = faker.random.alphaNumeric();

            jest.spyOn(
                passwordResetRepository,
                'findByToken',
            ).mockImplementation(() => Promise.resolve({} as PasswordReset));

            // Act
            const checkPasswordRecoveryToken = async (): Promise<void> => {
                await userService.checkPasswordRecoveryToken(command);
            };

            // Assert
            await expect(checkPasswordRecoveryToken()).resolves;
        });
    });

    describe('changePassword', () => {
        it('should throw NotFoundException when password reset token does not exist', async () => {
            // Arrange
            const command = new ChangePasswordCommand();
            command.token = faker.random.alphaNumeric();
            command.password = faker.internet.password();

            jest.spyOn(
                passwordResetRepository,
                'findByToken',
            ).mockImplementation(() => Promise.resolve(null));

            // Act
            const changePassword = async (): Promise<void> => {
                await userService.changePassword(command);
            };

            // Assert
            await expect(changePassword()).rejects.toThrow(NotFoundException);
        });

        it('should change password when password reset token exists', async () => {
            // Arrange
            const command = new ChangePasswordCommand();
            command.token = faker.random.alphaNumeric();
            command.password = faker.internet.password();

            const fakeId = faker.random.alphaNumeric();

            jest.spyOn(
                passwordResetRepository,
                'findByToken',
            ).mockImplementation(() =>
                Promise.resolve({ user: { id: fakeId } } as PasswordReset),
            );

            const spyFindUser = jest
                .spyOn(userRepository, 'findById')
                .mockImplementation(() => Promise.resolve({} as User));

            const spyStartTransaction = jest
                .spyOn(transaction, 'start')
                .mockImplementation(() => null);

            // Act
            await userService.changePassword(command);

            // Assert
            expect(spyFindUser).toBeCalledWith(fakeId);
            expect(spyStartTransaction).toBeCalled();
        });
    });
});
