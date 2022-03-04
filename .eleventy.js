const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const pluginRss = require('@11ty/eleventy-plugin-rss')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy("emojis/*.png")
  eleventyConfig.addPassthroughCopy("ogp/ogp.png")

  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });
  eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
    code,
    callback
  ) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error("Terser error: ", err);
      callback(null, code);
    }
  });

  eleventyConfig.addTransform("htmlmin", function (content) {
    if (this.outputPath && this.outputPath.endsWith(".html")) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  return {
    dir: {
      input: "gallery-site",
      output: "_site"
    }
  }
};