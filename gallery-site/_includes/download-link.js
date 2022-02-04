const png = document.querySelector("#download-png");
const svg = document.querySelector("#download-svg");

function setDownloadLink() {
  const extList = [];
  if (png.checked) {
    extList.push("png");
  }
  if (svg.checked) {
    extList.push("svg");
  }

  const link = document.querySelector("#download-link");
  link.href = `/archive/emoji${extList.map(ext => `-${ext}`).join("")}.zip`;
}

setDownloadLink();
png.addEventListener("change", setDownloadLink);
svg.addEventListener("change", setDownloadLink);