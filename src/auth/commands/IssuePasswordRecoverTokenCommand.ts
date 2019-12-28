import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class IssuePasswordRecoverTokenCommand {
    public email: string;

    public static Schema = class IssuePasswordRecoverTokenCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                email: Validation.rules
                    .string()
                    .email()
                    .required(),
            });
        }
    };
}
