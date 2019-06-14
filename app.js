const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

let nextStart = Date.now();

app.get("/", (req, res) => {
  console.log(req.query);

  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.setHeader("X-start-at", nextStart);
  res.send(JSON.stringify(req.query.time - Date.now()));
});

app.use(express.static("static"));

function tick() {
  nextStart = Date.now() + 4000;
  setTimeout(tick, 2000);
}

app.listen(port, () => {
  console.log("listening on port: " + port);
  tick();
});
