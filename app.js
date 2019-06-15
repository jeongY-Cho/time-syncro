const express = require("express");

const nunjucks = require("nunjucks");

const app = express();
nunjucks.configure("views", {
  autoescape: true,
  express: app
});
const port = process.env.PORT || 3000;

var videoLength = 217;

var syncedVideoPos = 0;
var nextStartTime = Date.now();
var nextStartPos = 0;
var videoId = "F4oHuML9U2A";
app.set("view engine", "njk");

app.put("/set", (req, res) => {
  syncedVideoPos = 0;
  nextStartPost = 0;
  videoId = req.query.videoId;
  videoLength = req.query.videoLength;

  res.sendStatus(200);
});

app.use(express.static("static"));

app.get("/index", (req, res) => {
  res.render("index", { videoId });
});

app.get("/time", (req, res) => {
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.setHeader("X-start-at", nextStartTime);
  res.setHeader("X-start-pos", nextStartPos);
  res.send(JSON.stringify(Date.now()));
});

function setHead() {
  setTimeout(setHead, 2000);
}

function tick() {
  // do something each second
  syncedVideoPos++;
  nextStartTime = Date.now() + 6000;
  nextStartPos = syncedVideoPos + 6;
  if (syncedVideoPos === videoLength) {
    syncedVideoPos = 0;
  }
  setTimeout(tick, 1000);
}

app.listen(port, () => {
  console.log("listening on port: " + port);
  tick();
  setHead();
});
