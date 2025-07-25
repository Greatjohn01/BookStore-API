import nodemailer from "nodemailer";

export const sendVerificationToken = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Email',
      html: `
        <p>Please kindly verify your email</p>
        <p>Use the following token to verify your email: <strong>${token}</strong></p>
        <p>This token will expire in 10 minutes</p>
        <p>Thank you for registering with us!</p>
      `,
    });

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};