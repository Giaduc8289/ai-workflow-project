import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRouter = (controller: AuthController): Router => {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/refresh-token', controller.refreshToken);

  return router;
};
