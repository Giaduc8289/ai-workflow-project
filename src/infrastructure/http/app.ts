import express, { Express } from 'express';
import { AuthUseCases, AuthController } from './controllers/auth.controller';
import { errorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { createAuthRouter } from './routes/auth.routes';

export const createApp = (useCases: AuthUseCases): Express => {
  const app = express();
  const authController = new AuthController(useCases);

  app.use(express.json());
  app.use('/api/v1/auth', createAuthRouter(authController));
  app.use(errorHandlerMiddleware);

  return app;
};
