import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  status: z.enum(['available', 'unavailable']).optional(),
});
