import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().min(0),
  reorderThreshold: z.number().min(0),
  costPerUnit: z.number().min(0),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  reorderThreshold: z.number().min(0).optional(),
  costPerUnit: z.number().min(0).optional(),
});

export const adjustStockSchema = z.object({
  type: z.enum(['Purchase', 'Sale', 'Waste', 'Adjustment', 'Return']),
  delta: z.number().refine((n) => n !== 0, { message: 'Delta cannot be zero' }),
  note: z.string().optional(),
});
