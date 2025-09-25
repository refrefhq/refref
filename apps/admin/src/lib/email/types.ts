export interface EmailOptions {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: Error;
}

export interface MagicLinkEmailParams {
  email: string;
  url: string;
}

export interface InvitationEmailParams {
  id: string;
  email: string;
  role: string;
  inviterName?: string;
  inviterEmail?: string;
  inviteLink: string;
}
