import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BusinessException } from '@src/shared/exceptions/BusinessException';

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
    public catch(exception: any, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = HttpStatus.UNPROCESSABLE_ENTITY;

        response.status(status).json({
            statusCode: status,
            error: exception.error ? exception.error : 'Unprocessable Entity',
            message: exception.message,
        });
    }
}
