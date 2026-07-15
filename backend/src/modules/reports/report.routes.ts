import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const reportRouter = Router();
const controller = new ReportController();

reportRouter.use(authenticate, authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER));

reportRouter.get('/sales', controller.sales);
reportRouter.get('/menu-performance', controller.menuPerformance);
reportRouter.get('/inventory/low-stock', controller.lowStock);
reportRouter.get('/inventory/consumption', controller.consumption);
reportRouter.get('/waste', controller.waste);
reportRouter.get('/staff-sales', controller.staffSales);
reportRouter.get('/kitchen-performance', controller.kitchenPerformance);
