import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/server/db";
import { eq } from "drizzle-orm";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user has any products in their active organization
  if (session?.session.activeOrganizationId) {
    const existingProduct = await db.query.product.findFirst({
      where: eq(schema.product.orgId, session.session.activeOrganizationId),
    });

    if (existingProduct) {
      redirect("/programs");
    }
  }

  return <>{children}</>;
}
