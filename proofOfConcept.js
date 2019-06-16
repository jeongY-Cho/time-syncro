const router = require("express").Router();

var videoId = "F4oHuML9U2A";
var videoLength = 217;
var videoStartedAt = Date.now();
var delayMS = 6000;

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

router.put("/set", (req, res) => {
  videoStartedAt = Date.now();

  if (req.body.data.videoId && req.body.data.videoLength) {
    videoLength = Number(req.body.data.videoLength);
    videoId = req.body.data.videoId;
  }
  console.log(getVideoPos());

  res.sendStatus(200);
});

router.get("/", (req, res) => {
  res.render("index", { videoId });
});

router.get("/sync", (req, res) => {
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }

  let [nextStartPos, nextStartTime] = nextStart();
  res.setHeader("X-start-at", nextStartTime);
  res.setHeader("X-start-pos", nextStartPos);
  res.sendStatus(200);
});

module.exports = router;
