export const verifyEmailTemplate = (verifyLink: string): string => `
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
