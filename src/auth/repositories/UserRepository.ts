import { User } from '@src/auth/entities/User';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository {
    constructor(private readonly repository: Repository<User>) {}

    public async exists(entity: User): Promise<boolean> {
        const user = await this.repository
            .createQueryBuilder()
            .select('u.id')
            .from(User, 'u')
            .where('u.id = :id', { id: entity.id })
            .orWhere('u.email = :email', { email: entity.email })
            .getOne();

        return user ? true : false;
    }

    public async findByEmail(email: string): Promise<User> {
        return await this.repository
            .createQueryBuilder()
            .select(['u.id', 'u.name', 'u.password', 'u.email', 'r.name'])
            .from(User, 'u')
            .leftJoin('u.roles', 'r')
            .where('u.email = :email', { email })
            .getOne();
    }

    public async findById(id: string): Promise<User> {
        return await this.repository
            .createQueryBuilder()
            .select(['u.id', 'u.name', 'u.password', 'u.email', 'r.name'])
            .from(User, 'u')
            .leftJoin('u.roles', 'r')
            .where('u.id = :id', { id })
            .getOne();
    }

    public async save(user: User): Promise<User> {
        return await this.repository.save(user);
    }
}
