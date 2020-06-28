import { HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { Translation } from '@src/shared/services/Translation';
import Joi from 'joi';

@Injectable()
export abstract class ValidationPipe implements PipeTransform<any> {
    constructor(public readonly i18n: Translation) {}

    public language(): Joi.LanguageRootOptions {
        return {
            any: {
                required: this.i18n.t('VALIDATION_MESSAGE_REQUIRED'),
                empty: this.i18n.t('VALIDATION_MESSAGE_EMPTY'),
            },

            string: {
                email: this.i18n.t('VALIDATION_MESSAGE_EMAIL'),
            },
        };
    }

    public async transform(value: any): Promise<void> {
        const result = Joi.validate(value, this.buildSchema(this.i18n), {
            abortEarly: false,
            allowUnknown: true,
            language: this.language(),
        });

        if (result.error !== null) {
            const errors = [];

            result.error.details.forEach(element => {
                errors.push({
                    field: element.context.key,
                    message: element.message.replace(/"/g, `'`),
                });
            });

            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    error: errors,
                    message: this.i18n.t('VALIDATION_MESSAGE'),
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        return result.value;
    }

    public abstract buildSchema(i18n: Translation): object;
}
