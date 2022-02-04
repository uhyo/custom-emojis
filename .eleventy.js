module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("emojis/*.png")
  eleventyConfig.addPassthroughCopy("ogp/ogp.png")

  return {
    dir: {
      input: "gallery-site",
      output: "_site"
    }
  }
};