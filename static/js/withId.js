var serverTimeOffset;
var startedAt;

async function getPing() {
  let t0 = Date.now();
  let response = await axios.get("/time");
  let t1 = Date.now();
  return t1 - t0;
}

async function getAvgPing() {
  let pings = [];

  for (let _ = 0; _ < 5; _++) {
    pings.push(await getPing());
  }

  if (Math.sqrt(variance(pings)) < 5) {
    avgPing = pings.reduce((prev, curr) => prev + curr);
    return avgPing;
  } else {
    return await getAvgPing();
  }
}
getAvgPing();

async function getServerOffSet() {
  let response = await fetch("/time");
  let serverTime = await response.json();
  return Date.now() - serverTime - (await getAvgPing()) / 2;
}

function getServerTime() {
  return Date.now() - serverTimeOffset;
}

function getVideoTime() {
  return ((getServerTime() - startedAt) / 1000) << 0;
}

function getEpsilon() {
  return 1000 - (getServerTime() % 1000);
}

async function getVideoInfo() {
  let newVideo = document.getElementById("videoId").value;
  let response = await axios.get("/", {
    params: {
      id: newVideo || null
    }
  });
  console.log(response);
  startedAt = await parseInt(response.headers["x-video-started-at"]);
  if (newVideo) {
    player.loadVideoById(
      extractVideoIdFromURL(newVideo),
      getVideoTime() + alpha
    );
  }
}
function extractVideoIdFromURL(URL) {
  const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

  let matches = URL.match(rx);

  if (matches) {
    return matches[1];
  }
  return "";
}

function isNum(args) {
  args = args.toString();
  if (args.length == 0) return false;
  for (var i = 0; i < args.length; i++) {
    if (
      (args.substring(i, i + 1) < "0" || args.substring(i, i + 1) > "9") &&
      args.substring(i, i + 1) != "." &&
      args.substring(i, i + 1) != "-"
    ) {
      return false;
    }
  }
  return true;
}

function variance(arr) {
  var len = 0;
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == "") {
    } else if (!isNum(arr[i])) {
      alert(arr[i] + " is not number, Variance Calculation failed!");
      return 0;
    } else {
      len = len + 1;
      sum = sum + parseFloat(arr[i]);
    }
  }
  var v = 0;
  if (len > 1) {
    var mean = sum / len;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
      } else {
        v = v + (arr[i] - mean) * (arr[i] - mean);
      }
    }
    return v / len;
  } else {
    return 0;
  }
}
