import { Injectable, Logger } from '@nestjs/common';
import {
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
  SendSmtpEmail,
} from '@getbrevo/brevo';
import { EmailTemplates } from './email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiInstance: TransactionalEmailsApi;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  constructor() {
    // Initialize Brevo API client
    this.apiInstance = new TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY!,
    );

    this.fromEmail = process.env.BREVO_FROM_EMAIL || 'noreply@morphee.com';
    this.fromName = process.env.BREVO_FROM_NAME || 'Morphee';
  }

  async sendOTPEmail(
    toEmail: string,
    toName: string,
    otpCode: string,
  ): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.otpVerificationEmail(
        toName,
        otpCode,
      );

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: toEmail,
          name: toName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `OTP email sent to ${toEmail} - Message ID: ${result.body.messageId}`,
      );

      if (this.isDevelopment) {
        this.logger.debug(`OTP Code for ${toEmail}: ${otpCode}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${toEmail}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(toEmail: string, toName: string): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.welcomeEmail(toName);

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: toEmail,
          name: toName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `Welcome email sent to ${toEmail} - Message ID: ${result.body.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${toEmail}:`, error);
      // Don't throw - welcome email is not critical
    }
  }

  async sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    otpCode: string,
  ): Promise<void> {
    try {
      const { subject, html } = EmailTemplates.passwordResetEmail(
        toName,
        otpCode,
      );

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: toEmail,
          name: toName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `Password reset email sent to ${toEmail} - Message ID: ${result.body.messageId}`,
      );

      if (this.isDevelopment) {
        this.logger.debug(`Reset Code for ${toEmail}: ${otpCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${toEmail}:`,
        error,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  async sendNewQuestionEmail(data: {
    toEmail: string;
    toName: string;
    askerName: string;
    productTitle: string;
    productSlug: string;
    questionContent: string;
  }): Promise<void> {
    try {
      const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${data.productSlug}#qa`;

      const { subject, html } = EmailTemplates.newQuestionEmail({
        sellerName: data.toName,
        askerName: data.askerName,
        productTitle: data.productTitle,
        questionContent: data.questionContent,
        productUrl,
      });

      const sendSmtpEmail = new SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: data.toEmail,
          name: data.toName,
        },
      ];

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `New question notification sent to ${data.toEmail} - Message ID: ${result.body.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send new question email to ${data.toEmail}`,
      );
      this.logger.error(`Error details: ${JSON.stringify(error.response?.body || error.message)}`);
      // Don't throw - notification email is not critical
    }
  }
}
