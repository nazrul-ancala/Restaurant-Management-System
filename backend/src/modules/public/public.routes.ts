import { Router } from 'express';
import { PublicController } from './public.controller';

// Deliberately no authenticate/authorize middleware anywhere in this router —
// this is the customer-facing QR-ordering surface, reachable with zero login.
export const publicRouter = Router();
const controller = new PublicController();

publicRouter.get('/tables/:qrCode', controller.getTable);
publicRouter.get('/menu', controller.getMenu);
publicRouter.post('/orders', controller.createOrder);
publicRouter.get('/settings', controller.getSettings);
