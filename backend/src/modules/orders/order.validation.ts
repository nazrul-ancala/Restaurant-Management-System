import { z } from 'zod';

export const createOrderSchema = z.object({
  orderType: z.enum(['Dine-In', 'Takeaway', 'QR Order']),
  tableId: z.number().int().positive().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Pending', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled', 'Refunded']),
  paymentMethod: z.enum(['Cash', 'Debit Card', 'Credit Card', 'DuitNow QR']).optional(),
  refundReason: z.string().min(1).optional(),
});
