import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalsDir = path.join(__dirname, "..", "images", "photography", "originals");

export default function () {
  return fs
    .readdirSync(originalsDir)
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f))
    .sort()
    .map((f) => `./src/images/photography/originals/${f}`);
}
