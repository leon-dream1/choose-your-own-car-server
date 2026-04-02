"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordTemplate = exports.verifyEmailTemplate = void 0;
const verifyEmailTemplate = (verifyLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p>Please click below button to verify your email</p>
    <p>The Link will expire in 10 mintues</p>
    <a href="${verifyLink}"
       style="background:#4F46E5; color:white; padding:12px 24px;
              text-decoration:none; border-radius:6px; display:inline-block;">
      Verify Email
    </a>
    <p style="color:#999; font-size:12px; margin-top:20px;">
      Please ignore this email if you are not register
    </p>
  </div>
`;
exports.verifyEmailTemplate = verifyEmailTemplate;
const resetPasswordTemplate = (resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #DC2626;">Password Reset</h2>
    <p>You are request to reset your password</p>
    <p>Please click below button — This Link will expire in <strong>10</strong> mintues</p>
    <a href="${resetLink}"
       style="background:#DC2626; color:white; padding:12px 24px;
              text-decoration:none; border-radius:6px; display:inline-block;">
      Reset Password
    </a>
    <p style="color:#999; font-size:12px; margin-top:20px;">
      Please ignore this email if you are not request for reset password
    </p>
  </div>
`;
exports.resetPasswordTemplate = resetPasswordTemplate;
