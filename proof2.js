const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(path.join(process.cwd(), "/ffmpeg/bin/ffmpeg"));

// ffmpeg.ffprobe(path.join(__dirname, "assets/sample.mp4"), (err, metadata) => {
//   console.log(err);

//   console.log(metadata);
// });

function getVideoPos(now) {
  return ((now || Date.now()) - videoStartedAt) % (videoLength * 1000);
}

function nextStart() {
  let now = Date.now();

  let startTimeFromNow = now + delayMS;
  let startPosFromNow = getVideoPos(now) + delayMS;

  let alpha = startPosFromNow % 1000;
  startTimeFromNow -= alpha;
  return [(startPosFromNow / 1000) << 0, startTimeFromNow];
}

router.get("/", function(req, res) {
  res.render("proof2");
});

router.get("/video", function(req, res) {
  const path = "assets/sample.mp4";
  const stat = fs.statSync(path);
  const fileSize = stat.size;

  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4"
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

module.exports = router;
