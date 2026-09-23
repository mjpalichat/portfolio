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

  const existing = new Set(fs.readdirSync(originalsDir));

  return order
    .filter((f) => existing.has(f))
    .map((f) => `./src/images/photography/originals/${f}`);
}
