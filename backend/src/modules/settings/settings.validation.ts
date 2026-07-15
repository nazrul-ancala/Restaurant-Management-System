import { z } from 'zod';

export const updateSettingsSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
});
