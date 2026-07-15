import express from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './lib/prisma';
import { authRouter } from './modules/auth';
import { employeeRouter } from './modules/employees';
import { tableRouter } from './modules/tables';
import { menuRouter } from './modules/menu';
import { orderRouter } from './modules/orders';
import { inventoryRouter } from './modules/inventory';
import { publicRouter } from './modules/public';
import { reportRouter } from './modules/reports';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', async (_req, res) => {
  const roleCount = await prisma.role.count();
  res.json({ status: 'ok', db: 'connected', roles: roleCount });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/tables', tableRouter);
app.use('/api/v1/menu', menuRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/public', publicRouter);
app.use('/api/v1/reports', reportRouter);
