import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const inventoryRouter = Router();
const controller = new InventoryController();

inventoryRouter.use(authenticate);

inventoryRouter.get('/', controller.list);
inventoryRouter.post('/', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.create);
inventoryRouter.patch('/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.update);
inventoryRouter.delete('/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER), controller.remove);
inventoryRouter.patch(
  '/:id/adjust',
  authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.CHEF),
  controller.adjust
);
