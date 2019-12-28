import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class CheckPasswordRecoveryTokenCommand {
    public token: string;

    public static Schema = class CheckPasswordRecoveryTokenCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                token: Validation.rules.string().required(),
            });
        }
    };
}
