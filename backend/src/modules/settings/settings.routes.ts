import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const settingsRouter = Router();
const controller = new SettingsController();

settingsRouter.use(authenticate, authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER));

settingsRouter.get('/', controller.get);
settingsRouter.patch('/', controller.update);
