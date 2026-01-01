import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ApiResponse } from '../interfaces/common.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logException(exception);

    const errorInfo = this.getErrorInfo(exception);
    const errorResponse = this.buildErrorResponse(errorInfo, exception);

    response.status(errorInfo.status).json(errorResponse);
  }

  private logException(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(`Exception: ${exception.message}`, exception.stack);
    } else {
      this.logger.error('Unknown exception:', exception);
    }
  }

  private getErrorInfo(exception: unknown): {
    status: number;
    message: string;
    code: string;
    details?: any[];
  } {
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    if (this.isPrismaError(exception)) {
      return this.handlePrismaError(exception);
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.isDevelopment
          ? exception.message
          : 'Internal server error',
        code: 'SERVER_ERROR',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'SERVER_ERROR',
    };
  }

  private handleHttpException(exception: HttpException): {
    status: number;
    message: string;
    code: string;
    details?: any[];
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as any;
      return {
        status,
        message: responseObj.message || exception.message,
        code: this.getErrorCode(status),
        details: Array.isArray(responseObj.message)
          ? responseObj.message
          : undefined,
      };
    }

    return {
      status,
      message: exceptionResponse as string,
      code: this.getErrorCode(status),
    };
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    code: string;
  } {
    this.logger.error(
      `Prisma error - Code: ${exception.code}, Meta: ${JSON.stringify(exception.meta)}`,
    );

    const errorMap: Record<
      string,
      { status: number; message: string; code: string }
    > = {
      P2002: {
        status: HttpStatus.CONFLICT,
        message: `Resource already exists${exception.meta?.target ? `. Field: ${exception.meta.target}` : ''}`,
        code: 'DUPLICATE_ERROR',
      },
      P2025: {
        status: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
        code: 'NOT_FOUND',
      },
      P2003: {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid reference',
        code: 'REFERENCE_ERROR',
      },
    };

    const errorInfo = errorMap[exception.code];
    if (errorInfo) {
      return errorInfo;
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isDevelopment
        ? `Database error: ${exception.message}`
        : 'Database error',
      code: 'DATABASE_ERROR',
    };
  }

  private buildErrorResponse(
    errorInfo: {
      status: number;
      message: string;
      code: string;
      details?: any[];
    },
    exception: unknown,
  ): ApiResponse {
    const error: Record<string, any> = {
      code: errorInfo.code,
      message: errorInfo.message,
    };

    if (errorInfo.details && errorInfo.details.length > 0) {
      error.details = errorInfo.details;
    }

    if (this.isDevelopment && exception instanceof Error && exception.stack) {
      error.stack = exception.stack;
    }

    return {
      success: false,
      error: error as ApiResponse['error'],
    };
  }

  private isPrismaError(
    exception: unknown,
  ): exception is PrismaClientKnownRequestError {
    return exception instanceof PrismaClientKnownRequestError;
  }

  private getErrorCode(status: number): string {
    const statusCodeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.UNAUTHORIZED]: 'AUTHENTICATION_ERROR',
      [HttpStatus.FORBIDDEN]: 'AUTHORIZATION_ERROR',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'DUPLICATE_ERROR',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'BUSINESS_LOGIC_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_ERROR',
    };

    return statusCodeMap[status] || 'SERVER_ERROR';
  }
}
