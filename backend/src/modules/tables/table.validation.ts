import { z } from 'zod';

export const createTableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().positive(),
});

export const updateTableSchema = z.object({
  name: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  status: z.enum(['available', 'reserved', 'cleaning']).optional(),
});
