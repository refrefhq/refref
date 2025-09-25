import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, magicLink, organization } from "better-auth/plugins";
import { schema } from "@/server/db";
import { env } from "@/env";
import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import { emailService } from "@/lib/email";

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
      enabled: !!env.RESEND_API_KEY && env.RESEND_API_KEY !== "debug_key",
      apiKey: env.RESEND_API_KEY || "debug_key",
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
          logger.info("Sending magic link email", { url, email });
          const result = await emailService.sendMagicLink({ email, url });

          if (!result.success) {
            throw result.error || new Error("Failed to send magic link email");
          }

          logger.info("Magic link email sent successfully", { email });
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
      async sendInvitationEmail({ id, email, role, inviter }) {
        const inviteLink = `${env.NEXT_PUBLIC_APP_URL}/accept-invitation/${id}`;
        logger.info("Sending invitation email", { inviteLink, email, role });

        await emailService.sendInvitation({
          id,
          email,
          role,
          inviterName: inviter?.user?.name,
          inviterEmail: inviter?.user?.email,
          inviteLink,
        });
      },
    }),
    apiKey(),
  ],
  /**
   * This hook creates a new organization for the user if they don't have any org associations.
   * Also ensures we have an active organization set for the user.
   */
});
