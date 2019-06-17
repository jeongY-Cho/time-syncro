const router = require("express").Router();
const getVideoLength = require("./withIdUtils");

const defaultVideoId = "F4oHuML9U2A";
const bufferTime = 5000;

var videosInMemory = {};
var pendingTimeouts = {};

// set default video
videosInMemory.defaultVideoId = Date.now();
(function resetDefault() {
  setTimeout(() => {
    videosInMemory.defaultVideoId = Date.now();
    resetDefault();
  }, 217 * 1000);
})();

router.get("/", async (req, res) => {
  var videoId;
  if (req.query.id) {
    videoId = extractVideoIdFromURL(req.query.id);
  }

  if (videoId) {
    console.log(videosInMemory);

    if (videosInMemory[videoId]) {
      res.setHeader("x-video-started-at", videosInMemory[videoId]);
    } else {
      let videoLength = await getVideoLength(videoId);

      pendingTimeouts[videoId] = setTimeout(() => {
        delete videosInMemory[videoId];
        delete pendingTimeouts[videoId];
      }, videoLength * 1000);

      videosInMemory[videoId] = Date.now() + bufferTime;
      console.log(videosInMemory);

      res.setHeader("x-server-time", Date.now());
      res.setHeader("x-video-started-at", videosInMemory[videoId]);
    }
    res.sendStatus(200);
  } else {
    res.setHeader("x-video-started-at", videosInMemory.defaultVideoId);
    res.setHeader("x-server-time", Date.now());
    res.render("withId", { videoId: defaultVideoId });
  }
});

router.get("/status", (req, res) => {
  console.log({ videosInMemory, pendingTimeouts });
  return res.sendStatus(200);
  // return res.send(JSON.stringify({ videosInMemory, pendingTimeouts }));
});

// function setVideoTimeout(id, time) {
//   return setTimeout(() => {
//     delete pendingTimeouts[id];
//   }, time * 1000);
// }
module.exports = router;

function extractVideoIdFromURL(URL) {
  const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

  let matches = URL.match(rx);

  if (matches) {
    return matches[1];
  }
  return "";
}
