import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';
import { authRouter } from './modules/auth';
import { employeeRouter } from './modules/employees';
import { tableRouter } from './modules/tables';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  const roleCount = await prisma.role.count();
  res.json({ status: 'ok', db: 'connected', roles: roleCount });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/employees', employeeRouter);
app.use('/api/v1/tables', tableRouter);
