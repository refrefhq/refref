import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/state";

export async function POST(request: NextRequest) {
  try {
    // Get session cookie
    const sessionId = request.cookies.get("session")?.value;

    if (sessionId) {
      // Delete session from store
      deleteSession(sessionId);
    }

    // Create response
    const response = NextResponse.json({ success: true });

    // Clear session cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
