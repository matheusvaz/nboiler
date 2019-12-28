import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class ChangePasswordCommand {
    public password: string;
    public token: string;

    public static Schema = class ChangePasswordCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                password: Validation.rules.string().required(),
                token: Validation.rules.string().required(),
            });
        }
    };
}
