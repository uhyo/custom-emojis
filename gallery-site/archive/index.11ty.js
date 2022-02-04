const path = require('path')
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

exports.data = {
  pagination: {
    data: "extensions",
    size: 1
  },
  extensions: [
    [],
    ["png"],
    ["svg"],
    ["png", "svg"]
  ],
  permalink: ({ pagination: { items: [extensions] } }) => `archive/emoji${extensions.map(ext => `-${ext}`).join("")}.zip`
}

exports.render = async (data) => {
  const { pagination: { items: [extensions] } } = data;
  const rootDir = path.join(__dirname, "../../");
  const { stdout } = await execFile("zip", [
    /* recursive */ "-r",
    /* do not compress png */ "-n", ".png",
    /* output */ "-",
    /* input */ "emojis",
    /* specify target files */ "--include", ...(
      extensions.length === 0 ? ["*.nothing"] :
        extensions.map(ext => `*${ext}`))
  ], {
    cwd: rootDir,
    encoding: "buffer"
  })
  return stdout
}