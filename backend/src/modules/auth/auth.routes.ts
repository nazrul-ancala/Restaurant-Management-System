import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

export const authRouter = Router();
const controller = new AuthController();

authRouter.post('/login', controller.login);
authRouter.get('/me', authenticate, controller.me);
