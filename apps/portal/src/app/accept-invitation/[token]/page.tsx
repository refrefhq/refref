import { redirect } from "next/navigation";
import { logger } from "better-auth";
import { headers as getHeaders } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const headers = await getHeaders();
  const session = await auth.api.getSession({
    headers,
  });
  if (!session?.user) {
    // Redirect to signin but keep the token in the URL for after signin
    redirect(`/auth/signin?callbackUrl=/accept-invitation/${token}`);
  }

  try {
    // Accept the invitation server-side
    await auth.api.acceptInvitation({
      body: {
        invitationId: token,
      },
      headers,
    });
  } catch (error) {
    logger.error("Error accepting invitation", error);
    return (
      <div className="container flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">
          Failed to accept invitation. The invitation may be invalid or expired.
        </p>
      </div>
    );
  } finally {
    // wow cant have redirect in try catch
    // for ref: https://stackoverflow.com/questions/76191324/next-13-4-error-next-redirect-in-api-routes
    redirect("/");
  }
}
