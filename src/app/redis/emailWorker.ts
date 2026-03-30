import { Job, Worker } from 'bullmq';
import { redisConnection } from '../config/queue.config';
import { sendEmail } from '../utils/sendEmail';

type TEmailJob = {
  to: string;
  subject: string;
  html: string;
};

export const emailWorker = new Worker(
  'email-queue',
  async (job: Job<TEmailJob>) => {
    const { to, subject, html } = job.data;

    console.log(
      `📧 Sending email to ${to}... (attempt ${job.attemptsMade + 1})`
    );

    await sendEmail(to, subject, html);

    console.log(`✓ Email sent to ${to}`);
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`✓ Job ${job.id} completed — email sent to ${job.data.to}`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`✗ Job ${job?.id} failed:`, error.message);
});

emailWorker.on('ready', () => {
  console.log('✓ Email worker ready');
});
