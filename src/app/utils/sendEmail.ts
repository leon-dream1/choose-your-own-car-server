import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: config.email_user,
    to,
    subject: 'Verify Email',
    html: `<a href="${link}">Verify</a>`,
  });
};
