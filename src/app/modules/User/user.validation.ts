import z from 'zod';

const userRegisterValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(25).trim(),
    email: z.email(),
    password: z
      .string()
      .min(6)
      .max(20)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        'Password must contain letters and numbers'
      ),
  }),
  role: z.enum(['user', 'admin']).optional(),
});

const userLoginValidationSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z
      .string()
      .min(6)
      .max(20)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        'Password must contain letters and numbers'
      ),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.email('Invalid email'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(6)
      .max(20)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        'Password must contain letters and numbers'
      ),
  }),
});

export const userValidationSchema = {
  userRegisterValidationSchema,
  userLoginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
