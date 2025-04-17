import nodemailer from "nodemailer";
import { env } from "@/lib/env";

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
};

/**
 * Send an email using nodemailer
 * @param options Email options
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, html, text, from } = options;
  
  // Default sender address from environment variables
  const sender = from || env.EMAIL_FROM || 'no-reply@rekrut.com';
  
  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT),
    secure: env.EMAIL_SECURE === "true",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
  
  // In development, log the email to the console
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Email sent:');
    console.log('From:', sender);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text || '(HTML email)');
    console.log('HTML:', html);
  }
  
  // Send email
  await transporter.sendMail({
    from: sender,
    to,
    subject,
    text: text || '',
    html,
  });
}

/**
 * Generate a password reset email
 */
export function generatePasswordResetEmail(resetUrl: string, userName?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h2 style="color: #4f46e5;">Rekrut ATS</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h3>Password Reset Request</h3>
        <p>Hello ${userName || 'there'},</p>
        <p>We received a request to reset your password for your Rekrut ATS account. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Thanks,<br>The Rekrut Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Rekrut ATS. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate an account setup email
 */
export function generateAccountSetupEmail(setupUrl: string, email: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
        <h2 style="color: #4f46e5;">Rekrut ATS</h2>
      </div>
      <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <h3>Welcome to Rekrut ATS!</h3>
        <p>Hello,</p>
        <p>An account has been created for you on Rekrut ATS with the email address: <strong>${email}</strong></p>
        <p>To complete your account setup and create your password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Set Up Account</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${setupUrl}</p>
        <p>This link will expire in 24 hours for security reasons.</p>
        <p>Thanks,<br>The Rekrut Team</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© ${new Date().getFullYear()} Rekrut ATS. All rights reserved.</p>
      </div>
    </div>
  `;
}
