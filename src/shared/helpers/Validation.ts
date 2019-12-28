import Joi from 'joi';

export class Validation {
    public static rules = Joi;

    public static schema(schema?: Joi.SchemaMap): Joi.ObjectSchema {
        return this.rules.object(schema);
    }
}
