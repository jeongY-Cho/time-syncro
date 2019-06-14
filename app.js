const express = require("express");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  console.log(req.query);

  if (req.headers.origin) {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.send(JSON.stringify(req.query.time - Date.now()));
});

app.use(express.static("static"));

app.listen(port, () => {
  console.log("listening on port: " + port);
});
