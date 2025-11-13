#!/usr/bin/env tsx

import { copyFile, mkdir, readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const ROOT_DIR = join(__dirname, "..", "..", "..");
const PUBLIC_DIR = join(__dirname, "..", "public");

// Script configurations
const SCRIPTS = [
  {
    name: "attribution",
    version: "v1",
    sourcePath: join(
      ROOT_DIR,
      "packages",
      "attribution-script",
      "dist",
      "attribution-script.es.js"
    ),
    outputName: "attribution.v1.js",
  },
  {
    name: "widget",
    version: "v1",
    sourcePath: join(ROOT_DIR, "packages", "widget", "dist", "widget.es.js"),
    outputName: "widget.v1.js",
  },
];

interface BuildStats {
  name: string;
  version: string;
  size: number;
  checksum: string;
  outputPath: string;
}

async function calculateChecksum(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

async function formatBytes(bytes: number): Promise<string> {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function copyScript(config: (typeof SCRIPTS)[0]): Promise<BuildStats> {
  const outputPath = join(PUBLIC_DIR, config.outputName);

  // Check if source exists
  try {
    await stat(config.sourcePath);
  } catch (error) {
    throw new Error(
      `Source file not found: ${config.sourcePath}\nMake sure to build the ${config.name} package first.`
    );
  }

  // Copy file
  await copyFile(config.sourcePath, outputPath);

  // Get stats
  const stats = await stat(outputPath);
  const checksum = await calculateChecksum(outputPath);

  return {
    name: config.name,
    version: config.version,
    size: stats.size,
    checksum,
    outputPath,
  };
}

async function build() {
  console.log("🚀 Building RefRef assets...\n");

  try {
    // Ensure public directory exists
    await mkdir(PUBLIC_DIR, { recursive: true });

    // Copy all scripts
    const results: BuildStats[] = [];
    for (const config of SCRIPTS) {
      console.log(`📦 Copying ${config.name}...`);
      const stats = await copyScript(config);
      results.push(stats);
    }

    // Print summary
    console.log("\n✅ Build complete!\n");
    console.log("📊 Build Summary:");
    console.log("─".repeat(60));

    for (const result of results) {
      const sizeFormatted = await formatBytes(result.size);
      console.log(
        `${result.name.padEnd(20)} ${result.version.padEnd(10)} ${sizeFormatted.padEnd(15)} ${result.checksum}`
      );
    }

    console.log("─".repeat(60));
    console.log(`\n📁 Output directory: ${PUBLIC_DIR}`);
    console.log("\n📝 Next steps:");
    console.log("   1. Deploy public/ folder to Cloudflare Pages");
    console.log("   2. Point assets.refref.ai to the deployment");
    console.log("   3. Update NEXT_PUBLIC_ASSETS_URL in admin portal\n");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run build
build();
