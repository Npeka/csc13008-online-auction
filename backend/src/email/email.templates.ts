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

  /**
   * Bid Placed Email Template
   */
  static bidPlacedEmail(data: {
    sellerName: string;
    productTitle: string;
    bidAmount: string;
    bidCount: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('bid-placed.html', {
      sellerName: data.sellerName,
      productTitle: data.productTitle,
      bidAmount: data.bidAmount,
      bidCount: data.bidCount,
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `New Bid on "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Bidder Bid Confirmation Email Template
   */
  static bidderBidConfirmedEmail(data: {
    bidderName: string;
    productTitle: string;
    currentBid: string;
    maxBid: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('bidder-bid-confirmed.html', {
      bidderName: data.bidderName,
      productTitle: data.productTitle,
      currentBid: data.currentBid,
      maxBid: data.maxBid,
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Bid Confirmed on "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Outbid Notification Email Template
   */
  static bidderOutbidEmail(data: {
    userName: string;
    productTitle: string;
    yourBid: string;
    newHighestBid: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('bidder-outbid.html', {
      userName: data.userName,
      productTitle: data.productTitle,
      yourBid: data.yourBid,
      newHighestBid: data.newHighestBid,
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `You've been outbid on "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Description Updated Notification Email Template
   */
  static descriptionUpdatedEmail(data: {
    bidderName: string;
    productTitle: string;
    currentBid: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('description-updated.html', {
      bidderName: data.bidderName,
      productTitle: data.productTitle,
      currentBid: data.currentBid,
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Description updated for "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Bidder Rejected Email Template
   */
  static bidderRejectedEmail(data: {
    userName: string;
    productTitle: string;
    rejectionReason?: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('bidder-rejected.html', {
      userName: data.userName,
      productTitle: data.productTitle,
      rejectionReason: data.rejectionReason || 'No specific reason provided',
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Bidding access revoked for "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Auction Ended Email Template (for winner)
   */
  static auctionEndedWinnerEmail(data: {
    userName: string;
    productTitle: string;
    finalPrice: string;
    orderUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('auction-ended.html', {
      userName: data.userName,
      productTitle: data.productTitle,
      finalPrice: data.finalPrice,
      winnerName: data.userName,
      nextSteps: '🎉 Congratulations! You won the auction!',
      nextStepsDetail:
        'Please proceed to complete your order by submitting payment proof and your shipping address.',
      orderUrl: data.orderUrl,
      productUrl: '',
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `🎉 You Won! "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }

  /**
   * Auction Ended Email Template (for non-winner)
   */
  static auctionEndedNonWinnerEmail(data: {
    userName: string;
    productTitle: string;
    finalPrice: string;
    winnerName: string;
    productUrl: string;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('auction-ended.html', {
      userName: data.userName,
      productTitle: data.productTitle,
      finalPrice: data.finalPrice,
      winnerName: data.winnerName,
      nextSteps: 'The auction has ended',
      nextStepsDetail:
        'Unfortunately, another bidder won this auction. Thank you for participating! Browse more products to find your next great deal.',
      orderUrl: '',
      productUrl: data.productUrl,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Auction Ended: "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }
  /**
   * Admin Initiated Password Reset Email Template
   */
  static adminResetPasswordEmail(
    userName: string,
    newPassword: string,
    loginUrl: string,
  ): { subject: string; html: string } {
    const html = this.loadTemplate('admin-reset-password.html', {
      userName,
      newPassword,
      loginUrl,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: `Your ${this.BRAND_NAME} Password Has Been Reset`,
      html,
    };
  }

  /**
   * Seller Auction Ended Email Template
   */
  static sellerAuctionEndedEmail(data: {
    sellerName: string;
    productTitle: string;
    finalPrice: string;
    winnerName: string;
    bidCount: string;
    orderUrl: string;
    hasWinner: boolean;
  }): { subject: string; html: string } {
    const html = this.loadTemplate('seller-auction-ended.html', {
      sellerName: data.sellerName,
      productTitle: data.productTitle,
      finalPrice: data.finalPrice,
      winnerName: data.winnerName,
      bidCount: data.bidCount,
      orderUrl: data.orderUrl,
      title: data.hasWinner
        ? '🎉 Your Auction Sold Successfully!'
        : 'Your Auction Has Ended',
      message: data.hasWinner
        ? `Congratulations! Your auction for "${data.productTitle}" has ended with a winning bid of ${data.finalPrice}.`
        : `Your auction for "${data.productTitle}" has ended without any bids. You can relist this item if you'd like.`,
      brandName: this.BRAND_NAME,
      currentYear: new Date().getFullYear().toString(),
    });

    return {
      subject: data.hasWinner
        ? `🎉 Auction Sold: "${data.productTitle}" - ${this.BRAND_NAME}`
        : `Auction Ended: "${data.productTitle}" - ${this.BRAND_NAME}`,
      html,
    };
  }
}
