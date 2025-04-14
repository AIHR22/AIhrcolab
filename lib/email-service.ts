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

    notification: (notificationDetails: { title: string; message: string }) => `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${notificationDetails.title}</h2>
        <p>${notificationDetails.message}</p>
      </div>
    `,
  },
};