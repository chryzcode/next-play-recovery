import axios, { AxiosError } from "axios";

/**
 * Send a generic email via Brevo SMTP HTTP API
 */
export async function sendEmail(to: string, subject: string, htmlContent: string) {
  const API_KEY = process.env.BREVO_API_KEY as string;
  const senderEmail = process.env.SENDER_EMAIL as string;

  const payload = {
    sender: { name: "Next Play Recovery", email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });
    console.log("Email sent successfully via Brevo");
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Error sending email:", error.response?.data || error);
    }
    throw new Error("Error sending email");
  }
}

/**
 * Send a verification email via Brevo SMTP HTTP API
 */
export async function sendVerificationEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #f97316 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Next Play Recovery</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Thank you for registering with Next Play Recovery! Please verify your email address by clicking the button below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you did not create an account with Next Play Recovery, please ignore this email.
        </p>
      </div>
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2025 Next Play Recovery. All rights reserved.
        </p>
      </div>
    </div>
  `;
  await sendEmail(to, "Verify your Next Play Recovery account", htmlContent);
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #f97316 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Next Play Recovery</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          You requested to reset your password for your Next Play Recovery account. Click the button below to create a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
      </div>
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2025 Next Play Recovery. All rights reserved.
        </p>
      </div>
    </div>
  `;
  await sendEmail(to, "Reset your Next Play Recovery password", htmlContent);
}

/**
 * Send a welcome email
 */
export async function sendWelcomeEmail(to: string, name: string) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #f97316 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Next Play Recovery</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Next Play Recovery!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Hi ${name},
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Welcome to Next Play Recovery! We're excited to help you track and manage your children's sports injuries with confidence.
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Here's what you can do with your account:
        </p>
        <ul style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          <li>Track injury recovery progress with our 3-phase system</li>
          <li>Manage multiple children and injuries in one place</li>
          <li>Access expert resources and recovery tips</li>
          <li>Upload photos with secure privacy protection</li>
          <li>Get email reminders for injury updates</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Get Started
          </a>
        </div>
      </div>
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2025 Next Play Recovery. All rights reserved.
        </p>
      </div>
    </div>
  `;
  await sendEmail(to, "Welcome to Next Play Recovery!", htmlContent);
}

/**
 * Send an injury update reminder email
 */
export async function sendInjuryReminderEmail(to: string, name: string, childName: string, injuryType: string, injuryId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const dashboardUrl = `${baseUrl}/dashboard`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #f97316 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Next Play Recovery</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Injury Update Reminder</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Hi ${name},
        </p>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          It's been a few days since you last updated the recovery status for ${childName}'s ${injuryType}. 
          Keeping track of recovery progress helps ensure a safe and effective return to sports.
        </p>
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 8px 0;">Why Update Recovery Status?</h3>
          <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
            <li>Track progress through recovery phases</li>
            <li>Ensure safe return to activity</li>
            <li>Get personalized recovery guidance</li>
            <li>Maintain accurate injury history</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Update Recovery Status
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions about recovery or need guidance, please don't hesitate to reach out to your healthcare provider.
        </p>
      </div>
      <div style="background: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">
          © 2025 Next Play Recovery. All rights reserved.
        </p>
      </div>
    </div>
  `;
  await sendEmail(to, `Update ${childName}'s ${injuryType} Recovery Status`, htmlContent);
} 