import { ErrorRequestHandler } from 'express';
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
  InvalidInputException,
  InvalidTokenException,
  UserNotFoundException,
} from '../../../domain/exceptions/auth.exception';

const statusForError = (error: unknown): number => {
  if (error instanceof InvalidInputException) {
    return 400;
  }

  if (error instanceof InvalidCredentialsException || error instanceof InvalidTokenException) {
    return 401;
  }

  if (error instanceof UserNotFoundException) {
    return 404;
  }

  if (error instanceof EmailAlreadyInUseException) {
    return 409;
  }

  return 500;
};

export const errorHandlerMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  const status = statusForError(error);
  const productionMessage = status === 500 ? 'Internal Server Error' : 'Request failed';
  const message =
    process.env.NODE_ENV === 'production'
      ? productionMessage
      : error instanceof Error
        ? error.message
        : productionMessage;

  response.status(status).json({ message });
};
