import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";
import prodBundle from "@refref/referral-widget/dist/referral-widget.es.js";
import { env } from "@/env";

// Serve the widget bundle, hot-reloading in dev, cached in prod
export async function GET() {
  const headers = {
    "Content-Type": "application/javascript",
  };

  try {
    if (env.NODE_ENV === "development") {
      // In dev, always read the latest bundle from disk
      const bundlePath = join(
        process.cwd(),
        "node_modules",
        "@refref",
        "referral-widget",
        "dist",
        "referral-widget.es.js",
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
