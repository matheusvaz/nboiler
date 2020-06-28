require('dotenv').config();

import { SnakeNamingStrategy } from '@src/shared/helpers/SnakeNamingStrategy';
import { join } from 'path';

const defaultConnection = {
    type: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNC === 'true' ? true : false,
    logging: process.env.APP_ENV === 'production' ? false : true,
    entities: [join(__dirname, 'src/**/entities/*.{ts,js}')],
    migrations: [join(__dirname, 'src/**/migrations/*.{ts,js}')],
    namingStrategy: new SnakeNamingStrategy(),
};

const testConnection = {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    dropSchema: true,
    entities: [join(__dirname, 'src/**/entities/*.{ts,js}')],
    migrations: [join(__dirname, 'src/**/migrations/*.{ts,js}')],
    namingStrategy: new SnakeNamingStrategy(),
};

module.exports = process.env.APP_ENV === 'testing' ? { ...testConnection } : { ...defaultConnection };
