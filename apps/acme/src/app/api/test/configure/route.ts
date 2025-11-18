import { NextRequest, NextResponse } from "next/server";
import { setRefRefConfig } from "@/lib/refref-runtime-config";
import { cookies } from "next/headers";

/**
 * Test-only endpoint to configure RefRef integration
 * This allows tests to provide ACME with RefRef credentials dynamically
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { productId, clientId, clientSecret, programId } = body;

    // Validate required fields
    if (!productId || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: "productId, clientId, and clientSecret are required" },
        { status: 400 },
      );
    }

    // Set the runtime configuration in memory
    setRefRefConfig({
      productId,
      clientId,
      clientSecret,
      programId,
    });

    // Also store config in cookies for persistence across requests
    const cookieStore = await cookies();

    // Store non-secret config in cookies
    cookieStore.set(
      "refref-config",
      JSON.stringify({
        productId,
        clientId,
        programId,
        // Store secret separately for security
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Allow in development
        maxAge: 60 * 60, // 1 hour
      },
    );

    // Store secret separately with more secure settings
    cookieStore.set("refref-secret", clientSecret, {
      httpOnly: true,
      sameSite: "strict",
      secure: false, // Allow in development
      maxAge: 60 * 60, // 1 hour
    });

    return NextResponse.json({
      success: true,
      message: "RefRef configuration updated",
      config: { productId, programId }, // Don't return secrets
    });
  } catch (error) {
    console.error("Configure error:", error);
    return NextResponse.json({ error: "Failed to configure" }, { status: 500 });
  }
}
