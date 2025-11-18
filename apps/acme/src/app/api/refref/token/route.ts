import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getSession, getUserById } from "@/lib/state";
import {
  getRefRefConfig,
  getRefRefConfigSync,
} from "@/lib/refref-runtime-config";

/**
 * Generate a JWT token for the current user to authenticate with RefRef API
 * This endpoint is called by the client-side widget initialization
 */
export async function GET() {
  try {
    // Get session from cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No session found" },
        { status: 401 },
      );
    }

    // Get session and user
    const session = getSession(sessionCookie.value);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid session" },
        { status: 401 },
      );
    }

    const user = getUserById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User not found" },
        { status: 401 },
      );
    }

    // Get RefRef configuration
    // Try to read from cookies directly first (for test scenarios)
    let config: any;
    try {
      const configCookie = cookieStore.get("refref-config");
      const secretCookie = cookieStore.get("refref-secret");

      if (configCookie && secretCookie) {
        const parsedConfig = JSON.parse(configCookie.value);
        config = {
          ...parsedConfig,
          clientSecret: secretCookie.value,
        };
        console.log("RefRef config from cookies:", {
          productId: config.productId,
          programId: config.programId,
        });
      } else {
        // Fall back to regular config if no cookies
        config = await getRefRefConfig();
        console.log("RefRef config from getRefRefConfig:", {
          productId: config.productId,
          programId: config.programId,
        });
      }
    } catch (e) {
      // If cookie reading fails, use regular config
      config = await getRefRefConfig();
      console.log("RefRef config from fallback:", {
        productId: config.productId,
        programId: config.programId,
      });
    }

    if (!config.clientSecret || !config.productId) {
      return NextResponse.json(
        { error: "Configuration Error", message: "RefRef not configured" },
        { status: 500 },
      );
    }

    // Generate JWT token
    // The token payload must match jwtPayloadSchema from @refref/types:
    // {
    //   sub: string (external user ID)
    //   productId: string
    //   email?: string
    //   name?: string
    // }
    const token = await new SignJWT({
      sub: user.id, // Use ACME's user ID as the external ID
      productId: config.productId,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Token valid for 24 hours
      .sign(new TextEncoder().encode(config.clientSecret));

    return NextResponse.json({
      token,
      productId: config.productId,
      programId: config.programId,
    });
  } catch (error) {
    console.error("Error generating RefRef token:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to generate token" },
      { status: 500 },
    );
  }
}
