import { z } from 'zod';

export const createPublicOrderSchema = z.object({
  qrCode: z.string().min(1),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});
