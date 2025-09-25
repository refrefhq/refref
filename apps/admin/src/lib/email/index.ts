import { Resend } from "resend";
import { logger } from "@/lib/logger";
import { env } from "@/env";
import type {
  EmailOptions,
  EmailResult,
  MagicLinkEmailParams,
  InvitationEmailParams,
} from "./types";
import { magicLinkTemplate, invitationTemplate } from "./templates";

class EmailService {
  private resend: Resend | null = null;
  private isDevelopmentMode = false;
  private defaultFrom = "RefRef <notifications@mail.refref.ai>";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.resend = new Resend(apiKey);
      logger.info("Email service initialized with Resend API");
    } else {
      this.isDevelopmentMode = true;
      logger.warn(
        "⚠️  Email service running in development mode - emails will be logged to console only",
      );
      logger.warn(
        "⚠️  To send real emails, set RESEND_API_KEY environment variable",
      );
    }
  }

  private async sendWithResend(options: EmailOptions): Promise<EmailResult> {
    if (!this.resend) {
      throw new Error("Resend is not initialized");
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        id: data?.id,
      };
    } catch (error) {
      logger.error("Failed to send email via Resend", { error });
      throw error;
    }
  }

  private logEmailToConsole(options: EmailOptions): void {
    const separator = "=".repeat(80);

    console.log(`\n${separator}`);
    console.log("📧 EMAIL (Development Mode)");
    console.log(separator);
    console.log(`From: ${options.from || this.defaultFrom}`);
    console.log(
      `To: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`,
    );
    console.log(`Subject: ${options.subject}`);
    if (options.replyTo) {
      console.log(`Reply-To: ${options.replyTo}`);
    }
    console.log(`${separator}`);
    console.log("HTML Content Preview:");
    console.log(`${separator}`);

    // Extract text content from HTML for console display
    const textContent = options.html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script tags
      .replace(/<[^>]+>/g, "\n") // Replace HTML tags with newlines
      .replace(/\n\s*\n/g, "\n") // Remove multiple newlines
      .replace(/^\s+|\s+$/g, "") // Trim whitespace
      .split("\n")
      .filter((line) => line.trim()) // Remove empty lines
      .map((line) => line.trim())
      .join("\n");

    console.log(textContent);
    console.log(`${separator}`);

    // Log any links found in the HTML
    const linkRegex = /href="([^"]+)"/g;
    const links = [...options.html.matchAll(linkRegex)].map(
      (match) => match[1],
    );

    if (links.length > 0) {
      console.log("🔗 Links in email:");
      links.forEach((link) => {
        console.log(`   - ${link}`);
      });
      console.log(separator);
    }

    console.log("✅ Email logged successfully (not sent - development mode)");
    console.log(`${separator}\n`);
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    // Log the email intent
    logger.info("Attempting to send email", {
      to: options.to,
      subject: options.subject,
      isDevelopmentMode: this.isDevelopmentMode,
    });

    if (this.isDevelopmentMode) {
      // Development mode: log to console
      this.logEmailToConsole(options);

      return {
        success: true,
        id: `dev-${Date.now()}`,
      };
    }

    // Production mode: send via Resend
    const result = await this.sendWithResend(options);

    logger.info("Email sent successfully", {
      to: options.to,
      subject: options.subject,
      id: result.id,
    });

    return result;
  }

  async sendMagicLink(params: MagicLinkEmailParams): Promise<EmailResult> {
    const html = magicLinkTemplate(params);

    return this.send({
      to: params.email,
      subject: "Your Magic Link - Sign in to RefRef",
      html,
    });
  }

  async sendInvitation(params: InvitationEmailParams): Promise<EmailResult> {
    const html = invitationTemplate(params);

    return this.send({
      to: params.email,
      subject: "You've been invited to join a project on RefRef",
      html,
    });
  }
}

const emailService = new EmailService(env.RESEND_API_KEY);

export { emailService, EmailService, type EmailOptions, type EmailResult };
