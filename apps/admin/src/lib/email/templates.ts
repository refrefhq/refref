import type { MagicLinkEmailParams, InvitationEmailParams } from "./types";

export const magicLinkTemplate = ({ url }: MagicLinkEmailParams): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #111827;
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
          .link-text {
            color: #9ca3af;
            font-size: 12px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sign in to Your Account</h1>
          <p>Click the button below to sign in to your RefRef account. This link will expire in 10 minutes.</p>
          <a href="${url}" class="button">Sign in to RefRef</a>
          <p class="link-text">Or copy this link: ${url}</p>
          <div class="footer">
            <p>If you did not request this email, please ignore it. No action is needed.</p>
            <p>This is an automated message from RefRef. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const invitationTemplate = ({
  role,
  inviterName,
  inviterEmail,
  inviteLink,
}: InvitationEmailParams): string => {
  const inviterDisplay = inviterName || inviterEmail || "Someone";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 600;
          }
          .content {
            padding: 30px;
          }
          p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .role-badge {
            display: inline-block;
            background: #f3f4f6;
            color: #111827;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
          }
          .info-box h3 {
            margin: 0 0 12px 0;
            color: #111827;
            font-size: 16px;
          }
          .info-box ul {
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
          }
          .info-box li {
            margin-bottom: 8px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
          }
          .link-text {
            color: #9ca3af;
            font-size: 12px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You've been invited to RefRef</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>
              <strong>${inviterDisplay}</strong> has invited you to join their project on RefRef as a
              <span class="role-badge">${role}</span>.
            </p>

            <div class="info-box">
              <h3>What is RefRef?</h3>
              <ul>
                <li>A powerful referral program management platform</li>
                <li>Track and reward customer referrals automatically</li>
                <li>Boost growth through word-of-mouth marketing</li>
                <li>Real-time analytics and insights</li>
              </ul>
            </div>

            <p>Accept this invitation to start collaborating on referral programs.</p>

            <a href="${inviteLink}" class="button">Accept Invitation</a>

            <p class="link-text">Or copy this link: ${inviteLink}</p>

            <div class="footer">
              <p><strong>This invitation will expire in 7 days.</strong></p>
              <p>If you didn't expect this invitation, you can safely ignore this email. No action will be taken.</p>
              <p>This is an automated message from RefRef. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
