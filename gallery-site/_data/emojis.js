// @ts-check

const path = require("path");
const fs = require("fs/promises");
const util = require("util");
const child_process = require("child_process");

module.exports = async () => {
  const emojisDir = path.join(__dirname, "../../emojis");
  // get all .png files in the dir
  const read = await fs.readdir(emojisDir);
  const files = read.filter((file) => file.endsWith(".png"));
  const emojis = files.sort().map((file) => {
    const name = file.slice(0, -4);
    return {
      name,
      url: `/emojis/${encodeURIComponent(file)}`,
    };
  });

  const emojiUrls = new Map(emojis.map(emoji => [emoji.name, emoji.url]));

  const history = await getEmojiHistory(emojisDir, emojiUrls);

  console.log(history)
  return {
    emojisDir,
    emojis,
    history,
  };
};

/**
 * @param {string} emojisDir
 * @param {Map<string, string>} emojiUrls
 */
async function getEmojiHistory(emojisDir, emojiUrls) {
  const { stdout: gitlog } = await util.promisify(child_process.exec)(
    `git log --name-status --format=format:"commit %H %ad" --date=iso8601-strict --relative -- "*.png"`,
    {
      cwd: emojisDir
    }
  )
  // Example output:
  // commit a219d6201d7c42cf16b9b4ee2272fb17ad219cb8 2022-03-04T21:02:01+09:00
  // A       writing_face.png
  //
  // commit 5932ed7164bd6854d911a8316f83cb25ed27a85f 2022-02-06T14:10:53+09:00
  // M       reading_face.png
  // M       reading_face.svg

  const history = [];
  let currentCommitTime = undefined
  let currentCommitHash = ""

  const lines = gitlog.split("\n");
  for (const line of lines) {
    if (line.startsWith("commit ")) {
      [, currentCommitHash, currentCommitTime] = line.split(" ")
      currentCommitTime = new Date(currentCommitTime);
      continue;
    }
    if (!currentCommitTime) {
      continue;
    }
    if (line.startsWith("A")) {
      const emojiName = getEmojiName(line.slice(1).trim()).replace(/\.png$/, "");
      history.push({
        type: "add",
        emojiName,
        url: emojiUrls.get(emojiName),
        hash: currentCommitHash,
        date: currentCommitTime
      })
      continue;
    }
    if (line.startsWith("M")) {
      const emojiName = getEmojiName(line.slice(1).trim()).replace(/\.png$/, "");
      history.push({
        type: "modify",
        emojiName,
        url: emojiUrls.get(emojiName),
        hash: currentCommitHash,
        date: currentCommitTime
      })
      continue;
    }
  }
  return history;
}

const decoder = new util.TextDecoder('utf-8');

function getEmojiName(name) {
  // thinking_無 is encoded like "emojis/thinking_\\347\\204\\241.png", so we need to decode it
  if (/^".*"$/.test(name)) {
    name = name.slice(1, -1);
    const buf = new Uint8Array(name.length);
    const encodedRegExp = /\\(\d+)/y;
    let bufIndex = 0;
    for (let strIndex = 0; strIndex < name.length; strIndex++) {
      encodedRegExp.lastIndex = strIndex;
      const m = encodedRegExp.exec(name);
      if (m) {
        buf[bufIndex++] = parseInt(m[1], 8);
        strIndex += m[0].length - 1;
      } else {
        buf[bufIndex++] = name.charCodeAt(strIndex);
      }
    }
    name = decoder.decode(buf.subarray(0, bufIndex));
  }
  return name
}