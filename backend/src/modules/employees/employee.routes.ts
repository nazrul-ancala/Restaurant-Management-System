import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const employeeRouter = Router();
const controller = new EmployeeController();

employeeRouter.use(authenticate, authorize(ROLES.ADMINISTRATOR));

employeeRouter.get('/roles', controller.listRoles);
employeeRouter.get('/', controller.list);
employeeRouter.get('/:id', controller.getById);
employeeRouter.post('/', controller.create);
employeeRouter.patch('/:id', controller.update);
employeeRouter.patch('/:id/deactivate', controller.deactivate);
employeeRouter.patch('/:id/activate', controller.activate);
employeeRouter.patch('/:id/reset-password', controller.resetPassword);
