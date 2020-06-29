import { Module } from '@nestjs/common';
import { TokenController } from '@src/auth/controllers/TokenController';
import { UserController } from '@src/auth/controllers/UserController';
import { TokenFactory } from '@src/auth/factories/TokenFactory';
import { UserFactory } from '@src/auth/factories/UserFactory';
import { PasswordResetRepository } from '@src/auth/repositories/PasswordResetRepository';
import { UserRepository } from '@src/auth/repositories/UserRepository';
import { TokenService } from '@src/auth/services/TokenService';
import { UserService } from '@src/auth/services/UserService';
import { Repository } from '@src/shared/helpers/Repository';

@Module({
    providers: [
        UserService,
        UserFactory,
        TokenService,
        TokenFactory,
        Repository.provide(UserRepository),
        Repository.provide(PasswordResetRepository),
    ],
    controllers: [UserController, TokenController],
})
export class AuthModule {}
