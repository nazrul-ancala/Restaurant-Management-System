import { Router } from 'express';
import { TableController } from './table.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const tableRouter = Router();
const controller = new TableController();

tableRouter.use(authenticate, authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.WAITER));

tableRouter.get('/', controller.list);
tableRouter.post('/', controller.create);
tableRouter.patch('/:id', controller.update);
tableRouter.delete('/:id', controller.remove);
