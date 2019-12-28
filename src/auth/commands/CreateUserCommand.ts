import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class CreateUserCommand {
    public name: string;
    public email: string;
    public password: string;

    public static Schema = class CreateUserCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                name: Validation.rules
                    .string()
                    .required()
                    .max(255),

                email: Validation.rules
                    .string()
                    .email()
                    .required(),

                password: Validation.rules.string().required(),
            });
        }
    };
}
