import Image from "@11ty/eleventy-img";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Matches the .photo-grid column-count breakpoints in style.css exactly
// (1 col <=480px, 2 cols <=760px, 3 cols <=1100px, 4 cols above that) so the
// browser knows the real on-screen width instead of a rough guess.
async function imageShortcode(
  src,
  alt,
  section,
  sizes = "(max-width: 480px) 100vw, (max-width: 760px) 50vw, (max-width: 1100px) 33vw, 25vw"
) {
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
        `file in content/${section}/items/ and will NOT appear on the site: ${unused.join(", ")}`
    );
  }
}

// Registers a `content/<section>/items/*.md` folder as an Eleventy
// collection named `section`, sorted by each item's `order` field, and
// wires up the orphan-image safety check for it. This is the one place
// that knows how a "section" (photography, design, ...) is put together —
// adding a new section should only ever mean one more call to this.
function registerContentCollection(eleventyConfig, section) {
  eleventyConfig.addCollection(section, (collectionApi) => {
    const items = [
      ...collectionApi.getFilteredByGlob(`src/content/${section}/items/*.md`),
    ].sort((a, b) => a.data.order - b.data.order);

    warnAboutUnusedImages(
      section,
      path.join(__dirname, `src/content/${section}/originals`),
      items.map((item) => item.data.image)
    );

    return items;
  });
}

export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", imageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });

  registerContentCollection(eleventyConfig, "photography");
  registerContentCollection(eleventyConfig, "design");
  registerContentCollection(eleventyConfig, "mv");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
}
