// @ts-check

const path = require('path');
const fs = require('fs/promises');

module.exports = async () => {
  const emojisDir = path.join(__dirname, "../../emojis");
  // get all .png files in the dir
  const files = (await fs.readdir(emojisDir)).filter(file => file.endsWith(".png"));
  const emojis = files.sort()
    .map(file => {
      const name = file.slice(0, -4)
      return {
        name,
        url: `/emojis/${file}`
      }
    })
  return {
    emojis
  }
}