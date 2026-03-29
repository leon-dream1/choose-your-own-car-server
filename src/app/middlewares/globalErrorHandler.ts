import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import config from '../config';
import AppError from '../errors/AppError';

export type TErrorSources = {
  path: string;
  message: string;
}[];

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // default response
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err?.code === 11000) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Duplicate field value';

    const field = Object.keys(err.keyValue)[0];

    errorSources = [
      {
        path: field,
        message: `${field} already exists`,
      },
    ];
  } else if (err?.name === 'ZodError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';

    errorSources = err.issues.map((issue: any) => ({
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    }));
  } else if (err?.name === 'ValidationError') {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';

    errorSources = Object.values(err.errors).map((val: any) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    });
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    console.log('Error', err);

    statusCode = httpStatus.BAD_REQUEST;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    // err,
    errorSources,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
