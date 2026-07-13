import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.number().int().positive(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  roleId: z.number().int().positive().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6),
});
