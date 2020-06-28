import { FactoryProvider } from '@nestjs/common/interfaces';
import { Connection } from 'typeorm';

export class Repository {
    public static provide(repository: any): FactoryProvider {
        return {
            provide: repository,
            useFactory: (connection: Connection): typeof repository => connection.getCustomRepository(repository),
            inject: [Connection],
        };
    }
}
