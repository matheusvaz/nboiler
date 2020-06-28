import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ChangePasswordCommand } from '@src/auth/commands/ChangePasswordCommand';
import { CheckPasswordRecoveryTokenCommand } from '@src/auth/commands/CheckPasswordRecoveryTokenCommand';
import { IssuePasswordRecoverTokenCommand } from '@src/auth/commands/IssuePasswordRecoverTokenCommand';
import { CreateUserCommand } from '@src/auth/commands/CreateUserCommand';
import { PasswordReset } from '@src/auth/entities/PasswordReset';
import { UserFactory } from '@src/auth/factories/UserFactory';
import { Profile } from '@src/auth/models/Profile';
import { PasswordResetRepository } from '@src/auth/repositories/PasswordResetRepository';
import { UserRepository } from '@src/auth/repositories/UserRepository';
import { Transaction } from '@src/shared/helpers/Transaction';
import { Crypto } from '@src/shared/services/Crypto';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly userFactory: UserFactory,
        private readonly passwordResetRepository: PasswordResetRepository,
        private readonly transaction: Transaction,
    ) {}

    public async getProfile(id: string): Promise<Profile> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException();
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }

    public async create(request: CreateUserCommand): Promise<void> {
        const user = await this.userFactory.create(request.name, request.email, request.password);

        if (await this.userRepository.exists(user)) {
            return;
        }

        await this.userRepository.save(user);

        this.logger.log(`User ${user.id} was created.`);
    }

    public async issuePasswordRecoverToken(command: IssuePasswordRecoverTokenCommand): Promise<void> {
        const user = await this.userRepository.findByEmail(command.email);

        if (!user) {
            return;
        }

        let passwordReset = await this.passwordResetRepository.findByUserId(user.id);

        if (passwordReset) {
            // TODO: Send token via transport
            return;
        }

        const token = await Crypto.token();

        passwordReset = new PasswordReset();
        passwordReset.user = user;
        passwordReset.token = await Crypto.genericHash(token);

        await this.passwordResetRepository.save(passwordReset);

        // TODO: Send token via transport

        this.logger.log(`Password recovery for ${user.id} requested.`);
    }

    public async checkPasswordRecoveryToken(command: CheckPasswordRecoveryTokenCommand): Promise<void> {
        if (!(await this.passwordResetRepository.findByToken(await Crypto.genericHash(command.token)))) {
            throw new NotFoundException();
        }
    }

    public async changePassword(command: ChangePasswordCommand): Promise<void> {
        const passwordReset = await this.passwordResetRepository.findByToken(await Crypto.genericHash(command.token));

        if (!passwordReset) {
            throw new NotFoundException();
        }

        const user = await this.userRepository.findById(passwordReset.user.id);
        user.password = await Crypto.passwordHash(command.password);

        await this.transaction.start(async manager => {
            await manager.save(user);
            await manager.remove(passwordReset);
        });

        this.logger.log(`User ${user.id} changed password.`);
    }
}
