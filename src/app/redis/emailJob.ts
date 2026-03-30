import {
  resetPasswordTemplate,
  verifyEmailTemplate,
} from '../utils/emailTemplate';
import { emailQueue } from './emailQueue';

export const addVerifyEmailJob = async (
  email: string,
  verifyLink: string
): Promise<void> => {
  await emailQueue.add(
    'verify-email',
    {
      to: email,
      subject: 'Choose Your Own Car — Verify your Email',
      html: verifyEmailTemplate(verifyLink),
    },
    {
      jobId: `verify-${email}`,
    }
  );

  console.log(`✓ Verify email job added for ${email}`);
};

export const addResetPasswordJob = async (
  email: string,
  resetLink: string
): Promise<void> => {
  await emailQueue.add(
    'reset-password',
    {
      to: email,
      subject: 'Choose Your Own Car — Password Reset',
      html: resetPasswordTemplate(resetLink),
    },
    {
      jobId: `reset-${email}-${Date.now()}`,
    }
  );
  console.log(`✓ Reset password job added for ${email}`);
};
