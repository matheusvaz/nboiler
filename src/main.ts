import { INestApplication } from '@nestjs/common';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/module';
import { BusinessExceptionFilter } from '@src/shared/exceptions/BusinessExceptionFilter';
import compression from 'compression';
import * as devcert from 'devcert';
import fs from 'fs';
import { hidePoweredBy, hsts, noCache, permittedCrossDomainPolicies } from 'helmet';
import morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

export class Application {
    private async https(): Promise<HttpsOptions> {
        if (process.env.APP_ENV !== 'production') {
            const options = await devcert.certificateFor('localhost');

            return {
                key: options.key,
                cert: options.cert,
            };
        }

        const keyPath = process.env.APP_SSL_KEY_PATH;
        const certPath = process.env.APP_SSL_CERT_PATH;

        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.log('You have to provide a certificate.');
            process.exit();
        }

        return {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };
    }

    private middleware(app: INestApplication): void {
        app.enableCors();
        app.use(
            hsts({
                maxAge: 31536000, // 1 Year
                includeSubDomains: true,
                preload: true,
            }),
        );
        app.use(compression());
        app.use(noCache());
        app.use(hidePoweredBy());
        app.use(permittedCrossDomainPolicies());
    }

    private httpLogger(app: INestApplication, logger: any): void {
        app.use(
            morgan('combined', {
                stream: {
                    write: (message: string): void => {
                        logger.log(message);
                    },
                },
            }),
        );
    }

    private globalLogger(app: INestApplication, logger: any): void {
        app.useLogger(logger);
    }

    private filters(app: INestApplication): void {
        app.useGlobalFilters(new BusinessExceptionFilter());
    }

    public async run(): Promise<void> {
        const app = await NestFactory.create(AppModule, {
            httpsOptions: await this.https(),
        });
        const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

        this.middleware(app);
        this.httpLogger(app, logger);
        this.filters(app);

        await app.listen(process.env.APP_PORT);

        this.globalLogger(app, logger);
    }
}

new Application().run();
