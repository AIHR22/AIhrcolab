import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const emailService = {
  async sendEmail({ to, subject, html, from = 'notifications@aihr-suite.com' }: EmailOptions) {
    try {
      const result = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  },

  // Email templates
  templates: {
    systemUpdate: (updateDetails: { title: string; description: string }) => `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${updateDetails.title}</h2>
        <p>${updateDetails.description}</p>
      </div>
    `,

    notification: (details: { title: string; message: string }) => `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">${details.title}</h2>
          <p style="color: #4a4a4a; line-height: 1.6;">${details.message}</p>
        </div>
        <div style="text-align: center; color: #6b7280; font-size: 14px;">
          <p>This is an automated notification from AIHR Suite.</p>
        </div>
      </div>
    `,
  },
};