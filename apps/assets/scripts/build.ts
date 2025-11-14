#!/usr/bin/env tsx

import { copyFile, mkdir, readFile, stat } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";
import { gzipSync, brotliCompressSync, constants as zlibConstants } from "zlib";
import chokidar from "chokidar";

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
      "attribution-script.umd.js"
    ),
    outputName: "attribution.v1.js",
  },
  {
    name: "widget",
    version: "v1",
    sourcePath: join(ROOT_DIR, "packages", "widget", "dist", "widget.umd.js"),
    outputName: "widget.v1.js",
  },
];

interface BuildStats {
  name: string;
  version: string;
  size: number;
  gzipSize: number;
  brotliSize: number;
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

  // Read content for compression stats
  const content = await readFile(outputPath);

  // Get stats
  const stats = await stat(outputPath);
  const checksum = await calculateChecksum(outputPath);

  // Calculate compressed sizes (what users actually download)
  const gzipSize = gzipSync(content, { level: 9 }).length;
  const brotliSize = brotliCompressSync(content, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11, // Maximum compression
    },
  }).length;

  return {
    name: config.name,
    version: config.version,
    size: stats.size,
    gzipSize,
    brotliSize,
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
    console.log("─".repeat(90));
    console.log(
      "Script".padEnd(20) +
        "Version".padEnd(10) +
        "Original".padEnd(15) +
        "Gzip".padEnd(15) +
        "Brotli".padEnd(15) +
        "Hash"
    );
    console.log("─".repeat(90));

    for (const result of results) {
      const sizeFormatted = await formatBytes(result.size);
      const gzipFormatted = await formatBytes(result.gzipSize);
      const brotliFormatted = await formatBytes(result.brotliSize);

      // Calculate compression ratios
      const gzipRatio = (
        ((result.size - result.gzipSize) / result.size) *
        100
      ).toFixed(1);
      const brotliRatio = (
        ((result.size - result.brotliSize) / result.size) *
        100
      ).toFixed(1);

      console.log(
        `${result.name.padEnd(20)}${result.version.padEnd(10)}${sizeFormatted.padEnd(15)}${gzipFormatted.padEnd(15)}${brotliFormatted.padEnd(15)}${result.checksum}`
      );
      console.log(
        `${"".padEnd(40)}(-${gzipRatio}%)${"".padEnd(8)}(-${brotliRatio}%)`
      );
    }

    console.log("─".repeat(90));
    console.log(
      "\n💡 Cloudflare serves with Brotli compression automatically"
    );
    console.log(`📁 Output directory: ${PUBLIC_DIR}`);
    console.log("\n📝 Next steps:");
    console.log("   1. Deploy: pnpm -F @refref/assets deploy:cloudflare");
    console.log("   2. Verify: https://refref-assets.<account>.workers.dev");
    console.log("   3. Configure custom domain (optional)");
    console.log("   4. Update NEXT_PUBLIC_ASSETS_URL in webapp\n");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Check if watch mode is enabled
const isWatchMode = process.argv.includes("--watch");

if (isWatchMode) {
  console.log("👀 Starting watch mode...\n");

  // Get all source paths to watch
  const watchPaths = SCRIPTS.map((config) => config.sourcePath);

  // Create watcher
  const watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: false, // Trigger build on startup
  });

  watcher.on("add", async (filePath) => {
    console.log(`\n📝 File added: ${filePath}`);
    await build();
  });

  watcher.on("change", async (filePath) => {
    console.log(`\n📝 File changed: ${filePath}`);
    await build();
  });

  watcher.on("ready", () => {
    console.log("✅ Watching for file changes...");
    console.log(`📂 Watching: ${watchPaths.join(", ")}\n`);
  });

  watcher.on("error", (error) => {
    console.error("❌ Watcher error:", error);
  });
} else {
  // One-time build
  build();
}
