import { Router } from 'express';
import { TableController } from './table.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const tableRouter = Router();
const controller = new TableController();

tableRouter.use(authenticate);

tableRouter.get('/', controller.list);
tableRouter.post('/', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.WAITER), controller.create);
tableRouter.patch('/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.WAITER), controller.update);
tableRouter.delete('/:id', authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.WAITER), controller.remove);
