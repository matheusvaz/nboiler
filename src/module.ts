import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormconfig from '@src/../ormconfig';
import { AuthModule } from '@src/auth/module';
import { SharedModule } from '@src/shared/module';
import { utilities, WinstonModule } from 'nest-winston';
import winston from 'winston';
import moment = require('moment');

@Module({
    imports: [
        AuthModule,
        SharedModule,
        TypeOrmModule.forRoot(ormconfig),
        WinstonModule.forRoot({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: moment().format('YYYY_MM_DD[.log]'),
                    dirname: 'logs',
                    format: winston.format.json(),
                    handleExceptions: true,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
                new winston.transports.Console({
                    level: 'debug',
                    handleExceptions: true,
                    format: winston.format.combine(winston.format.timestamp(), utilities.format.nestLike()),
                }),
            ],
        }),
    ],
})
export class AppModule {}
