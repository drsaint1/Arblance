import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'ArbLance <noreply@arblance.io>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // New job posted notification
  async sendNewJobNotification(email: string, jobTitle: string, jobId: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Job Posted!</h1>
          </div>
          <div class="content">
            <h2>A new job matching your skills has been posted</h2>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p>Check out this opportunity and apply before others!</p>
            <a href="${process.env.FRONTEND_URL}/jobs/${jobId}" class="button">View Job Details</a>
          </div>
          <div class="footer">
            <p>You're receiving this because you opted in for job notifications on ArbLance</p>
            <p><a href="${process.env.FRONTEND_URL}/profile">Update notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `New Job Posted: ${jobTitle}`,
      html,
    });
  }

  // New message notification
  async sendNewMessageNotification(email: string, senderName: string, messagePreview: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message</h1>
          </div>
          <div class="content">
            <p><strong>${senderName}</strong> sent you a message:</p>
            <div class="message-box">
              <p>${messagePreview}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/messages" class="button">View Message</a>
          </div>
          <div class="footer">
            <p>You're receiving this because you have unread messages on ArbLance</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `New message from ${senderName}`,
      html,
    });
  }

  // Job application received
  async sendJobApplicationNotification(email: string, jobTitle: string, applicantName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 New Application!</h1>
          </div>
          <div class="content">
            <h2>Someone applied to your job</h2>
            <p><strong>Job:</strong> ${jobTitle}</p>
            <p><strong>Applicant:</strong> ${applicantName}</p>
            <a href="${process.env.FRONTEND_URL}/my-jobs" class="button">Review Application</a>
          </div>
          <div class="footer">
            <p>ArbLance - Decentralized Freelancing Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `New application for: ${jobTitle}`,
      html,
    });
  }

  // Dispute opened notification
  async sendDisputeNotification(email: string, jobTitle: string, disputeId: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Dispute Opened</h1>
          </div>
          <div class="content">
            <h2>A dispute has been opened</h2>
            <p><strong>Job:</strong> ${jobTitle}</p>
            <p><strong>Dispute ID:</strong> ${disputeId}</p>
            <p>Please provide your evidence and explanation. Our admin team will review the case.</p>
            <a href="${process.env.FRONTEND_URL}/disputes/${disputeId}" class="button">View Dispute</a>
          </div>
          <div class="footer">
            <p>ArbLance Dispute Resolution</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Dispute opened for: ${jobTitle}`,
      html,
    });
  }

  // Dispute resolved notification
  async sendDisputeResolvedNotification(
    email: string,
    jobTitle: string,
    resolution: string,
    winner: string
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .resolution-box { background: white; padding: 20px; border-left: 4px solid #059669; margin: 20px 0; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Dispute Resolved</h1>
          </div>
          <div class="content">
            <h2>Your dispute has been resolved</h2>
            <p><strong>Job:</strong> ${jobTitle}</p>
            <p><strong>Decision:</strong> ${winner}</p>
            <div class="resolution-box">
              <p>${resolution}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/disputes" class="button">View Details</a>
          </div>
          <div class="footer">
            <p>ArbLance Dispute Resolution</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Dispute resolved: ${jobTitle}`,
      html,
    });
  }
}

export const emailService = new EmailService();
