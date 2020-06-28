import { Injectable } from '@nestjs/common';
import { User } from '@src/auth/entities/User';
import { Crypto } from '@src/shared/services/Crypto';

@Injectable()
export class UserFactory {
    public async create(name: string, email: string, password: string): Promise<User> {
        const user = new User();

        user.name = name;
        user.email = email;
        user.password = await Crypto.passwordHash(password);

        return user;
    }
}
