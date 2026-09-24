import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalsDir = path.join(__dirname, "..", "images", "photography", "originals");
const orderFile = path.join(__dirname, "photo-order.txt");

export default function () {
  const order = fs
    .readFileSync(orderFile, "utf8")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const existing = fs
    .readdirSync(originalsDir)
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
  const existingSet = new Set(existing);

  const ordered = order.filter((f) => existingSet.has(f));
  const orderedSet = new Set(ordered);
  const unlisted = existing.filter((f) => !orderedSet.has(f)).sort();

  if (unlisted.length) {
    console.log(
      `[photos.js] ${unlisted.length} photo(s) in originals/ are missing from photo-order.txt — ` +
        `adding them to the end for now: ${unlisted.join(", ")}`
    );
  }

  return [...ordered, ...unlisted].map(
    (f) => `./src/images/photography/originals/${f}`
  );
}
