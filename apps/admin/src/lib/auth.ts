import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, magicLink, organization } from "better-auth/plugins";
import { Resend } from "resend";
import { schema } from "@/server/db";
import { env } from "@/env";
import { db } from "@/server/db";
import { logger } from "@/lib/logger";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: false,
  },
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  /* emailVerification: {
    sendVerificationEmail: async ({ url }) => {
        console.log('verification link', url);
    }
  }, */
  emailProviders: {
    resend: {
      enabled: true,
      apiKey: env.RESEND_API_KEY,
      autosignup: true,
    },
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   }
  // },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          // Prepare the email content
          const emailContent = `
            <h1>Sign in to Your Account</h1>
            <p>Click the link below to sign in:</p>
            <a href="${url}">Sign in</a>
            <p>If you did not request this email, please ignore it.</p>
          `;
          logger.info("sending magic link email", { url, email });
          const { data, error } = await resend.emails.send({
            from: "notifications@mail.refref.ai",
            to: email,
            subject: "Your Magic Link",
            html: emailContent,
          });
        } catch (error) {
          console.error("Error sending magic link email", { error, email });
          logger.error("Error sending magic link email", { error, email });
          throw error;
        }
      },
    }),
    organization({
      schema: {
        organization: {
          modelName: "project",
        },
        session: {
          modelName: "session",
          fields: {
            activeOrganizationId: "activeProjectId",
          },
        },
        member: {
          modelName: "projectUser",
          fields: {
            organizationId: "projectId",
          },
        },
        invitation: {
          modelName: "invitation",
          fields: {
            organizationId: "projectId",
          },
        },
      },
      async sendInvitationEmail({ id, email, role, inviter, organization }) {
        const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${id}`;
        logger.info("Sending invitation email", { inviteLink, email, role });

        // Prepare the email content with proper styling
        const emailContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>You've been invited to RefRef</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>${inviter?.user?.name || inviter?.user?.email || "Someone"} has invited you to join their project on RefRef as a <strong>${role}</strong>.</p>
                  <p>RefRef is a powerful referral program management platform that helps businesses grow through word-of-mouth marketing.</p>
                  <a href="${inviteLink}" class="button">Accept Invitation</a>
                  <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${inviteLink}</p>
                  <div class="footer">
                    <p>This invitation will expire in 7 days.</p>
                    <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        try {
          const { data, error } = await resend.emails.send({
            from: "RefRef <notifications@mail.refref.ai>",
            to: email,
            subject: `You've been invited to join a project on RefRef`,
            html: emailContent,
          });

          if (error) {
            logger.error("Failed to send invitation email", { error, email });
            throw error;
          }

          logger.info("Invitation email sent successfully", { data, email });
        } catch (error) {
          logger.error("Error sending invitation email", { error, email });
          // Don't throw - let the invitation be created even if email fails
        }
      },
    }),
    apiKey(),
  ],
  /**
   * This hook creates a new organization for the user if they don't have any org associations.
   * Also ensures we have an active organization set for the user.
   */
});
