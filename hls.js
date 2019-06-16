const stream = "rtmp://184.72.239.149/vod/mp4:BigBuckBunny_115k.mov";

var http = require("http");
var HLSServer = require("hls-server");
var ffmpeg = require("fluent-ffmpeg");
var server = http.createServer();
var path = require("path");

ffmpeg.setFfmpegPath(path.join(process.cwd(), "/ffmpeg/bin/ffmpeg"));

// var hls = new HLSServer(server, {
//   path: "/streams", // Base URI to output HLS streams
//   dir: "assets/videos" // Directory that input files are stored
// });

ffmpeg("assets/sample.mp4", { timeout: 432000 })
  .addOptions([
    "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
    "-level 3.0",
    "-s 640x360", // 640px width, 360px height output video dimensions
    "-start_number 0", // start the first .ts segment at index 0
    "-hls_time 10", // 10 second segment duration
    "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
    "-f hls" // HLS format
  ])
  .output(process.stdout)
  .on("end", () => console.log("somehting"))
  .run();

// server.listen(8000, () => {
//   console.log("listening on port 8000");
// });
