import Image from "@11ty/eleventy-img";
import path from "node:path";

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

export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", imageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
}
