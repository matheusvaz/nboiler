export class BusinessException extends Error {
    private error: object;

    constructor(message?: string | object | any, error?: object) {
        super(message);
        this.error = error;
    }
}
