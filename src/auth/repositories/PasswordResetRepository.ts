import { PasswordReset } from '@src/auth/entities/PasswordReset';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(PasswordReset)
export class PasswordResetRepository {
    constructor(private readonly repository: Repository<PasswordReset>) {}

    public async findByUserId(userId: string): Promise<PasswordReset> {
        return await this.repository
            .createQueryBuilder()
            .select(['p.user_id', 'p.token'])
            .from(PasswordReset, 'p')
            .where('p.user_id = :userId', { userId })
            .getOne();
    }

    public async findByToken(token: string): Promise<PasswordReset> {
        return await this.repository
            .createQueryBuilder()
            .select(['u.id', 'p.token', 'p.id'])
            .from(PasswordReset, 'p')
            .innerJoin('p.user', 'u')
            .where('p.token = :token', { token })
            .getOne();
    }

    public async save(passwordReset: PasswordReset): Promise<PasswordReset> {
        return await this.repository.save(passwordReset);
    }

    public async remove(passwordReset: PasswordReset): Promise<void> {
        await this.repository.remove(passwordReset);
    }
}
