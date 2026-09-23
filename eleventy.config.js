import Image from "@11ty/eleventy-img";
import path from "node:path";

async function imageShortcode(src, alt, sizes = "(max-width: 700px) 100vw, 50vw", loading = "lazy") {
  if (!alt) throw new Error(`Missing alt text for image: ${src}`);

  let metadata = await Image(src, {
    widths: [400, 800, 1200, 1600, 2200, 2800],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/assets/images/photography/",
    urlPath: "/assets/images/photography/",
    filenameFormat: function (id, src, width, format) {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}w.${format}`;
    },
  });

  let imageAttributes = {
    alt,
    sizes,
    loading,
    decoding: loading === "eager" ? "sync" : "async",
    fetchpriority: loading === "eager" ? "high" : "auto",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", imageShortcode);
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
}
