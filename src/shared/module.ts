import { Global, Module } from '@nestjs/common';
import { AuthenticationRequired } from '@src/shared/guards/AuthenticationRequired';
import { Transaction } from '@src/shared/helpers/Transaction';
import { CacheAdapter } from '@src/shared/services/CacheAdapter';
import { Translation } from '@src/shared/services/Translation';

@Global()
@Module({
    providers: [Translation, CacheAdapter, Transaction, AuthenticationRequired],
    exports: [Translation, CacheAdapter, Transaction, AuthenticationRequired],
})
export class SharedModule {}
