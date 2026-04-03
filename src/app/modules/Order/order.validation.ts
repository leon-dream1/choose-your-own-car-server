import z from 'zod';

const createOrderSchema = z.object({
  body: z.object({
    carId: z.string().min(1, 'Car ID required'),
  }),
});

const respondOrderSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected']),
  }),
});

export const orderValidation = {
  createOrderSchema,
  respondOrderSchema,
};
