import { NextResponse } from "next/server";
import bundle from "@refref/attribution-script/dist/attribution-script.es.js";

export async function GET() {
  // Set appropriate headers for ESM
  const headers = {
    "Content-Type": "application/javascript",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "*",
  };

  try {
    return new NextResponse(bundle as unknown as string, { headers });
  } catch (error) {
    console.error("Error serving attribution script:", error);
    return new NextResponse(
      "console.error('Failed to load RefRef attribution');",
      {
        headers,
        status: 500,
      },
    );
  }
}
