import z from 'zod';

const createCarValidation = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.coerce
      .number()
      .min(1990)
      .max(new Date().getFullYear() + 1),
    price: z.coerce.number().min(0),
    mileage: z.coerce.number().min(0),
    condition: z.enum(['new', 'used']),
    description: z.string().max(2000).optional(),
    location: z.string().min(1),
  }),
});

export const carValidation = { createCarValidation };
