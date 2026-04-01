import z from 'zod';

const startConversationSchema = z.object({
  body: z.object({
    carId: z.string().min(1, 'Car ID is required'),
  }),
});

export const conversationValidation = {
  startConversationSchema,
};
