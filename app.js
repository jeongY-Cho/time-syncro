const express = require("express");

const nunjucks = require("nunjucks");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  console.log(Date.now());

  syncedVideoPos = 0;
  nextStartPost = 0;

  if (req.body.data.videoId && req.body.data.videoLength) {
    videoLength = Number(req.body.data.videoLength);
    videoId = req.body.data.videoId;
  }
  console.log(Date.now());
  res.sendStatus(200);
});

app.use(express.static("static"));

app.get("/", (req, res) => {
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
