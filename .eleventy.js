module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("emojis/*.png")

  return {
    dir: {
      input: "gallery-site",
      output: "_site"
    }
  }
};