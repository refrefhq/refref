import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/server/db";
const { referralLink, participant, product } = schema;
import { eq } from "drizzle-orm";

/**
 * Handles GET requests to /api/r/[id].
 * Reads the id slug, fetches participant details, and redirects with encoded params.
 */
/**
 * Handles GET requests to /api/r/[id].
 * Reads the id slug from the route param, fetches participant details, and redirects with encoded params.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    if (!id) {
      return new NextResponse("No id provided", { status: 400 });
    }
    // Find the referral link by slug
    const link = await db.query.referralLink.findFirst({
      where: eq(referralLink.slug, id),
    });
    if (!link) {
      return new NextResponse("Referral link not found", { status: 404 });
    }
    // Find the participant by participantId from the referral link
    const participantRecord = await db.query.participant.findFirst({
      where: eq(participant.id, link.participantId),
    });
    if (!participantRecord) {
      return new NextResponse("Participant not found", { status: 404 });
    }

    // Look up the product to get the redirect URL
    const productRecord = await db.query.product.findFirst({
      where: eq(product.id, participantRecord.productId),
    });

    // Use product URL if available, otherwise fallback to environment variable
    const redirectUrl = productRecord?.url;

    if (!redirectUrl) {
      console.error("No redirect URL configured", {
        productId: participantRecord.productId,
      });
      return new NextResponse("Redirect URL not configured for this product", {
        status: 500,
      });
    }

    // Helper to encode and only add non-empty values
    const encode = (value: string | null | undefined) =>
      value ? Buffer.from(value, "utf-8").toString("base64") : undefined;

    //! extra params, potentially enabled/disabled via config
    const paramsObj: Record<string, string | undefined> = {
      name: encode(participantRecord.name),
      email: encode(participantRecord.email),
      participantId: encode(participantRecord.id),
    };
    const searchParams = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    searchParams.set("rfc", id);

    // Redirect with 307 to the product URL with encoded params
    return NextResponse.redirect(
      `${redirectUrl}?${searchParams.toString()}`,
      307,
    );
  } catch (error) {
    // Log error and return 500
    console.error("Error in referral redirect handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
