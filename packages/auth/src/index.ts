import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey, magicLink, organization } from "better-auth/plugins";
import { renderMagicLinkEmail, renderInvitationEmail } from "@refref/email-templates";
import type { DBType } from "@refref/coredb";
import { Resend } from "resend";

export interface AuthConfig {
  /**
   * Base URL for the application (e.g., https://app.refref.com)
   */
  baseURL: string;

  /**
   * Resend API key for sending emails
   */
  resendApiKey: string;

  /**
   * Database instance
   */
  db: DBType;

  /**
   * Database schema
   */
  schema: Record<string, any>;

  /**
   * Enabled social auth providers
   */
  enabledSocialAuth: string[];

  /**
   * Enable password authentication
   */
  enablePasswordAuth: boolean;

  /**
   * Enable magic link authentication
   */
  enableMagicLinkAuth: boolean;

  /**
   * Google OAuth credentials (optional)
   */
  google?: {
    clientId: string;
    clientSecret: string;
  };

  /**
   * Logger instance
   */
  logger?: {
    info: (message: string, meta?: any) => void;
    error: (message: string, meta?: any) => void;
  };

  /**
   * PostHog instance for analytics
   */
  posthog?: {
    capture: (event: { distinctId: string; event: string; properties?: any }) => void;
  };

  /**
   * Trusted origins for CORS
   */
  trustedOrigins?: string[];
}

/**
 * Creates a Better Auth instance with the provided configuration
 */
export function getAuth(config: AuthConfig) {
  const {
    baseURL,
    resendApiKey,
    db,
    schema,
    enabledSocialAuth,
    enablePasswordAuth,
    enableMagicLinkAuth,
    google,
    logger,
    posthog,
    trustedOrigins = [baseURL],
  } = config;

  // Build social providers object dynamically based on enabled providers
  const socialProviders = enabledSocialAuth.reduce(
    (acc, provider) => {
      if (provider === "google" && google) {
        return {
          ...acc,
          google: {
            clientId: google.clientId,
            clientSecret: google.clientSecret,
          },
        };
      }
      // Add more providers here as needed (github, etc.)
      return acc;
    },
    {} as Record<string, { clientId: string; clientSecret: string }>,
  );

  // Initialize Resend for email sending
  const resend = new Resend(resendApiKey);

  return betterAuth({
    baseURL,
    socialProviders,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        ...schema,
      },
    }),
    emailAndPassword: {
      enabled: enablePasswordAuth,
    },
    trustedOrigins,
    emailProviders: {
      resend: {
        enabled: !!resendApiKey && resendApiKey !== "debug_key",
        apiKey: resendApiKey || "debug_key",
        autosignup: true,
      },
    },
    plugins: [
      ...(enableMagicLinkAuth
        ? [
            magicLink({
              sendMagicLink: async ({ email, url }) => {
                try {
                  logger?.info("Sending magic link email", { url, email });

                  const emailContent = await renderMagicLinkEmail(url);

                  await resend.emails.send({
                    from: "RefRef <notifications@refref.com>",
                    to: email,
                    subject: "Your Magic Link to Sign In",
                    html: emailContent,
                  });

                  logger?.info("Magic link email sent successfully", { email });
                } catch (error) {
                  console.error("Error sending magic link email", {
                    error,
                    email,
                  });
                  logger?.error("Error sending magic link email", {
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
          const inviteLink = `${baseURL}/accept-invitation/${id}`;
          logger?.info("Sending invitation email", { inviteLink, email, role });

          const emailContent = await renderInvitationEmail({
            role,
            inviterName: inviter?.user?.name,
            inviterEmail: inviter?.user?.email,
            inviteLink,
          });

          await resend.emails.send({
            from: "RefRef <notifications@refref.com>",
            to: email,
            subject: "You've been invited to RefRef",
            html: emailContent,
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
            posthog?.capture({
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

              logger?.info("Created default organization for new user", {
                userId: user.id,
                organizationId: newOrg!.id,
              });
            } catch (error) {
              logger?.error("Failed to create default organization for user", {
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
}

// Export types
export type Auth = ReturnType<typeof getAuth>;
