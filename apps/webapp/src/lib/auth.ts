import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, magicLink, organization } from "better-auth/plugins";
import { schema } from "@/server/db";
import { env } from "@/env";
import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import { emailService } from "@/lib/email";
import { posthog } from "@/lib/posthog";

// Build social providers object dynamically based on enabled providers
const socialProviders = env.NEXT_PUBLIC_ENABLED_SOCIAL_AUTH.reduce(
  (acc, provider) => {
    if (provider === "google") {
      return {
        ...acc,
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      };
    }
    // Add more providers here as needed (github, etc.)
    return acc;
  },
  {} as Record<string, { clientId: string; clientSecret: string }>,
);

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  socialProviders,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH,
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
    ...(env.NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH
      ? [
          magicLink({
            sendMagicLink: async ({ email, url }) => {
              try {
                logger.info("Sending magic link email", { url, email });
                const result = await emailService.sendMagicLink({ email, url });

                if (!result.success) {
                  throw (
                    result.error || new Error("Failed to send magic link email")
                  );
                }

                logger.info("Magic link email sent successfully", { email });
              } catch (error) {
                console.error("Error sending magic link email", {
                  error,
                  email,
                });
                logger.error("Error sending magic link email", {
                  error,
                  email,
                });
                throw error;
              }
            },
          }),
        ]
      : []),
    organization({
      schema: {
        organization: {
          modelName: "org",
        },
        session: {
          modelName: "session",
          fields: {
            activeOrganizationId: "activeOrganizationId",
          },
        },
        member: {
          modelName: "orgUser",
          fields: {
            organizationId: "orgId",
          },
        },
        invitation: {
          modelName: "invitation",
          fields: {
            organizationId: "organizationId",
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Track user signup event
          posthog.capture({
            distinctId: user.id,
            event: "user_sign_up",
            properties: {
              email: user.email,
              name: user.name || undefined,
            },
          });

          // Auto-create default organization for new users
          try {
            const { org: orgTable, orgUser } = schema;

            // Create default organization
            const [newOrg] = await db
              .insert(orgTable)
              .values({
                name: `${user.name || user.email}'s Organization`,
                slug: `org-${user.id.slice(0, 8)}`,
              })
              .returning();

            // Add user as owner of the organization
            await db.insert(orgUser).values({
              orgId: newOrg!.id,
              userId: user.id,
              role: "owner",
            });

            logger.info("Created default organization for new user", {
              userId: user.id,
              organizationId: newOrg!.id,
            });
          } catch (error) {
            logger.error("Failed to create default organization for user", {
              userId: user.id,
              error,
            });
            // Don't throw - allow user creation to succeed even if org creation fails
          }
        },
      },
    },
  },
});
