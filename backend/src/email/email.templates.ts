import { readFileSync } from 'fs';
import { join } from 'path';

export class EmailTemplates {
  // Resolve templates from project root (works in both dev and production)
  private static readonly TEMPLATES_DIR = join(
    process.cwd(),
    'src',
    'email',
    'templates',
  );
  private static readonly BRAND_NAME = 'Morphee';

  /**
   * Load HTML template from file and replace placeholders
   */
  private static loadTemplate(
    filename: string,
    variables: Record<string, string>,
  ): string {
    const templatePath = join(this.TEMPLATES_DIR, filename);
    let template = readFileSync(templatePath, 'utf-8');

    // Replace all {{variable}} placeholders
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, value);
    });

    return template;
  }

  /**
   * OTP Verification Email Template
   */
  static otpVerificationEmail(
    userName: string,
    otpCode: string,
  ): { subject: string; html: string } {
    const html = this.loadTemplate('otp-verification.html', {
      userName,
      otpCode,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Verify your ${this.BRAND_NAME} account - Code: ${otpCode}`,
      html,
    };
  }

  /**
   * Welcome Email Template
   */
  static welcomeEmail(userName: string): { subject: string; html: string } {
    const html = this.loadTemplate('welcome.html', {
      userName,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Welcome to ${this.BRAND_NAME} - Let's get started!`,
      html,
    };
  }

  /**
   * Password Reset Email Template
   */
  static passwordResetEmail(
    userName: string,
    otpCode: string,
  ): { subject: string; html: string } {
    const html = this.loadTemplate('password-reset.html', {
      userName,
      otpCode,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Reset your ${this.BRAND_NAME} password - Code: ${otpCode}`,
      html,
    };
  }

  /**
   * New Question Notification Email Template
   */
  static newQuestionEmail(data: {
    sellerName: string;
    askerName: string;
    productTitle: string;
    questionContent: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('new-question.html', {
      sellerName: data.sellerName,
      askerName: data.askerName,
      productTitle: data.productTitle,
      questionContent: data.questionContent,
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `New Question on "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }
}
