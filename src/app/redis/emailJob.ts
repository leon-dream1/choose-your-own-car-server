import { verifyEmailTemplate } from '../utils/verifyEmailTemplate';
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
