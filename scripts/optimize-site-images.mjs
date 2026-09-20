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

const WIDTHS = [320, 480, 640, 720, 800, 960, 1200, 1280, 1440, 1600, 1920];

/** Keep `stem` in sync with `LOCAL_RESPONSIVE_BASES` in `assets/js/site-image-delivery.js`. */
const MASTERS = [
  { file: "IMG_7567.jpeg", stem: "IMG_7567" },
  { file: "stuzkova_makeup/Stuzkova makeup 1.jpeg", stem: "stuzkova_makeup/stuzkova-1" },
  { file: "stuzkova_makeup/Stuzkova makeup 2.jpeg", stem: "stuzkova_makeup/stuzkova-2" },
  { file: "stuzkova_makeup/Stuzkova makeup 3.jpeg", stem: "stuzkova_makeup/stuzkova-3" },
  { file: "stuzkova_makeup/Stuzkova makeup 4.jpeg", stem: "stuzkova_makeup/stuzkova-4" },
  { file: "stuzkova_makeup/Stuzkova makeup 5.jpeg", stem: "stuzkova_makeup/stuzkova-5" },
];

for (const { file, stem } of MASTERS) {
  const source = join(imgDir, file);
  if (!existsSync(source)) {
    console.warn(`Skip ${file} (missing)`);
    continue;
  }

  for (const width of WIDTHS) {
    const target = join(imgDir, `${stem}-w${width}.webp`);
    if (existsSync(target)) {
      continue;
    }
    execFileSync(
      "convert",
      [source, "-auto-orient", "-strip", "-resize", `${width}x`, "-quality", "82", target],
      { stdio: "inherit" },
    );
    console.log(`Wrote ${target.replace(`${root}/`, "")}`);
  }
}
