import Image from "@11ty/eleventy-img";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function imageShortcode(src, alt, section, sizes = "(max-width: 700px) 100vw, 50vw") {
  if (!alt) throw new Error(`Missing alt text for image: ${src}`);
  if (!section) throw new Error(`Missing section (e.g. "photography") for image: ${src}`);

  let metadata = await Image(src, {
    widths: [400, 800, 1200, 1600, 2200],
    formats: ["webp", "jpeg"],
    outputDir: `./_site/assets/images/${section}/`,
    urlPath: `/assets/images/${section}/`,
    filenameFormat: function (id, src, width, format) {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

// Warns at build time if a photo sits in originals/ with no content file
// pointing at it, so a photo can never silently fail to appear.
function warnAboutUnusedImages(section, originalsDir, referencedFilenames) {
  const existing = fs
    .readdirSync(originalsDir)
    .filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
  const referenced = new Set(referencedFilenames);
  const unused = existing.filter((f) => !referenced.has(f));

  if (unused.length) {
    console.log(
      `[${section}] ${unused.length} image(s) in originals/ have no matching ` +
        `file in photography-items/ and will NOT appear on the site: ${unused.join(", ")}`
    );
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", imageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });

  eleventyConfig.addCollection("photography", (collectionApi) => {
    const items = [...collectionApi.getFilteredByGlob("src/photography-items/*.md")].sort(
      (a, b) => a.data.order - b.data.order
    );

    warnAboutUnusedImages(
      "photography",
      path.join(__dirname, "src/images/photography/originals"),
      items.map((item) => item.data.image)
    );

    return items;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
}
