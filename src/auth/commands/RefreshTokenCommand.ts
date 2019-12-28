import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class RefreshTokenCommand {
    public refreshToken: string;

    public static Schema = class RefreshTokenCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                refreshToken: Validation.rules.string().required(),
            });
        }
    };
}
