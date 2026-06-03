import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RequestWithId = Request & { requestId?: string };

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error?: string;
  path: string;
  requestId?: string;
  timestamp: string;
  stack?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithId>();
    const isProduction = process.env.NODE_ENV === 'production';

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const body = this.normalizeResponse(
      exceptionResponse,
      status,
      request.path,
      request.requestId,
    );

    if (!isProduction && exception instanceof Error) {
      body.stack = exception.stack;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} failed with ${status}`,
        exception instanceof Error ? exception.stack : 'Unknown exception',
      );
    }

    response.status(status).json(body);
  }

  private normalizeResponse(
    exceptionResponse: string | object | undefined,
    status: number,
    path: string,
    requestId: string | undefined,
  ): ErrorResponseBody {
    const fallbackMessage =
      status === 500 ? 'Internal server error' : 'Request failed';

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseBody = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      return {
        statusCode: status,
        message: responseBody.message || fallbackMessage,
        error: responseBody.error,
        path,
        requestId,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: status,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : fallbackMessage,
      path,
      requestId,
      timestamp: new Date().toISOString(),
    };
  }
}
