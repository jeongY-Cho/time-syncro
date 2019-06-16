const proofOfConcept = require("./proofOfConcept");
const proof2 = require("./proof2");
const playVideo = require("./playSyncedWithId");

const express = require("express");
const nunjucks = require("nunjucks");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

nunjucks.configure("views", {
  autoescape: true,
  express: app
});
app.set("view engine", "html");
const port = process.env.PORT || 3000;

app.use("/", playVideo);
app.use("/proof", proofOfConcept);
app.use("/proof2", proof2);
app.get("/time", (req, res) => {
  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }

  res.send(JSON.stringify(Date.now()));
});

app.listen(port, () => {
  console.log("listening on port: " + port);
});
