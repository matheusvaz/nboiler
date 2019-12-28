import { Validation } from '@src/shared/helpers/Validation';
import { ValidationPipe } from '@src/shared/pipes/ValidationPipe';

export class IssueTokenCommand {
    public email: string;
    public password: string;

    public static Schema = class IssueTokenCommandSchema extends ValidationPipe {
        public buildSchema(): object {
            return Validation.schema({
                email: Validation.rules
                    .string()
                    .email()
                    .required(),

                password: Validation.rules.string().required(),
            });
        }
    };
}
