import { Router } from 'express';
import { AuditLogController } from './audit-log.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { ROLES } from '../../constants/roles';

export const auditLogRouter = Router();
const controller = new AuditLogController();

auditLogRouter.use(authenticate, authorize(ROLES.ADMINISTRATOR, ROLES.MANAGER));

auditLogRouter.get('/', controller.list);
