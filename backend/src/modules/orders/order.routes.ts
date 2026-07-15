import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const orderRouter = Router();
const controller = new OrderController();

orderRouter.use(authenticate);

orderRouter.get('/', controller.list);
orderRouter.post('/', authorize(ROLES.WAITER, ROLES.MANAGER, ROLES.ADMINISTRATOR), controller.create);
// Per-transition RBAC is enforced in the service, not here, since one route serves every stage change.
orderRouter.patch('/:id/status', controller.updateStatus);
