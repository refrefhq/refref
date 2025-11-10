import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import prodBundle from "@refref/widget/dist/widget.es.js";
import { env } from "@/env";

// Serve the widget bundle, hot-reloading in dev, cached in prod
export async function GET() {
  const headers = {
    "Content-Type": "application/javascript",
  };

  // Check if referral program IDs are configured
  const isConfigured =
    env.NEXT_PUBLIC_REFREF_PROJECT_ID && env.NEXT_PUBLIC_REFREF_PROGRAM_ID;

  // Return no-op if not configured
  if (!isConfigured) {
    return new NextResponse(
      "// RefRef widget not loaded: project/program IDs not configured",
      { headers },
    );
  }

  try {
    if (env.NODE_ENV === "development") {
      // In dev, always read the latest bundle from disk
      const bundlePath = join(
        process.cwd(),
        "node_modules",
        "@refref",
        "widget",
        "dist",
        "widget.es.js",
      );
      const bundle = await fs.readFile(bundlePath, "utf-8");
      return new NextResponse(bundle, { headers });
    }

    // In prod, use the statically imported bundle
    return new NextResponse(prodBundle as unknown as string, { headers });
  } catch (error) {
    console.error("Error serving widget script:", error);
    return new NextResponse("console.error('Failed to load RefRef widget');", {
      headers,
      status: 500,
    });
  }
}
