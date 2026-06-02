/**
 * Generate responsive WebP variants for local site images.
 * Requires ImageMagick (`convert`). Run: npm run optimize:site-images
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const imgDir = join(root, "assets/img");

/** Keep in sync with `LOCAL_RESPONSIVE_BASES` in `assets/js/site-image-delivery.js`. */
const MASTERS = [
  {
    file: "IMG_7567.jpeg",
    widths: [320, 480, 640, 720, 800, 960, 1200, 1440],
  },
];

for (const { file, widths } of MASTERS) {
  const source = join(imgDir, file);
  if (!existsSync(source)) {
    console.warn(`Skip ${file} (missing)`);
    continue;
  }

  const stem = file.replace(/\.[^.]+$/, "");
  for (const width of widths) {
    const target = join(imgDir, `${stem}-w${width}.webp`);
    execFileSync(
      "convert",
      [source, "-auto-orient", "-strip", "-resize", `${width}x`, "-quality", "82", target],
      { stdio: "inherit" },
    );
    console.log(`Wrote ${target.replace(`${root}/`, "")}`);
  }
}
