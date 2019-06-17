var serverTimeOffset;
var startedAt;

async function getPing() {
  let t0 = Date.now();
  let response = await axios.get("/time");
  let t1 = Date.now();
  return t1 - t0;
}

async function getAvgPing() {
  let pings1 = [];
  let pings2 = [];


  for (let _ = 0; _ < 10; _++) {
    pings1.push(await getPing());
  }

  for (let _ = 0; _ < 10; _++) {
    pings2.push(await getPing());
  }

  let H0 = twoSampleTTest(pings1, pings2)

  if (H0) {

    return Math.round(pings1.concat(pings2).reduce((x, y) => x + y) / (pings1.length + pings2.length));
  } else {
    return await getAvgPing();
  }
}

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

async function getVideoInfo(url) {
  let newVideo = url;
  let response = await axios.get("/", {
    params: {
      id: newVideo || null
    }
  });
  console.log(response);
  startedAt = await parseInt(response.headers["x-video-started-at"]);
  if (newVideo) {
    this.frame.loadVideoById(
      extractVideoIdFromURL(newVideo),
      getVideoTime() + alpha
    );
    first = true
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

function twoSampleTTest(arr1, arr2) {

  let mean1 = arr1.reduce((x, y) => x + y)
  let var1 = variance(arr1)

  let mean2 = arr2.reduce((x, y) => x + y)
  let var2 = variance(arr2)

  let joinedSE = var1 / mean1 + var2 / mean2
  let T = (mean1 - mean2) / Math.sqrt(joinedSE)
  let dof = Math.pow(joinedSE, 2) / ((Math.pow(var1 / arr1.length, 2) / (arr1.length - 1)) + (Math.pow(var2 / arr2.length, 2) / (arr2.length - 1)))
  console.log(joinedSE * joinedSE);
  console.log((Math.pow(var1 / arr1.length, 2) / (arr1.length - 1)) + (Math.pow(var2 / arr2.length, 2) / (arr2.length - 1)))


  let cdf = jStat.studentt.cdf(T, dof)
  if (cdf < 0.975) {
    return true
  } else {
    return false
  }

}


class Syncronizer {
  isInit = false

  async init() {
    if (!this.isInit) {
      this.ping = await this.getAvgPing()
      this.serverOffset = await getServerOffSet()
      this.isInit = true
    } else {
      throw new Error("Already Initialized")
    }
  }

  async resync() {
    this.isInit = false
    await this.init()
  }

  async getPing() {
    let t0 = Date.now();
    let response = await axios.get("/time");
    let t1 = Date.now();
    return t1 - t0
  }

  async getAvgPing() {
    let pings1 = [];
    let pings2 = []

    for (let _ = 0; _ < 5; _++) {
      pings1.push(await this.getPing());
    }
    for (let _ = 0; _ < 5; _++) {
      pings2.push(await this.getPing());
    }

    if (Syncronizer.twoSampleTTest(pings1, pings2)) {
      return pings1.concat(pings2).reduce((prev, curr) => prev + curr) / (pings1.length + pings2.length);
    } else {
      return await getAvgPing();
    }
  }

  async getServerOffSet() {
    let response = await fetch("/time");
    let serverTime = await response.json();
    return Date.now() - serverTime - ((this.ping / 2) << 0);
  }

  get serverTime() {

    return Date.now() - this.serverOffset;
  }

  get epsilon() {
    return 1000 - (this.serverTime % 1000);
  }


  static isNum(args) {
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

  static variance(arr) {
    var len = 0;
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == "") {
      } else if (!Syncronizer.isNum(arr[i])) {
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
      return v / (len - 1);
    } else {
      return 0;
    }
  }
  static twoSampleTTest(arr1, arr2) {

    let mean1 = arr1.reduce((x, y) => x + y)
    let var1 = variance(arr1)

    let mean2 = arr2.reduce((x, y) => x + y)
    let var2 = variance(arr2)

    let joinedSE = var1 / mean1 + var2 / mean2
    let T = (mean1 - mean2) / Math.sqrt(joinedSE)
    let dof = Math.pow(joinedSE, 2) / ((Math.pow(var1 / arr1.length, 2) / (arr1.length - 1)) + (Math.pow(var2 / arr2.length, 2) / (arr2.length - 1)))
    console.log(joinedSE * joinedSE);
    console.log((Math.pow(var1 / arr1.length, 2) / (arr1.length - 1)) + (Math.pow(var2 / arr2.length, 2) / (arr2.length - 1)))


    let cdf = jStat.studentt.cdf(T, dof)
    if (cdf < 0.975) {
      return true
    } else {
      return false
    }

  }
}

class SyncedYT extends Syncronizer {
  constructor() {
    super()
    this.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)
  }

  videoId = "F4oHuML9U2A"
  alpha = 5
  first = true

  async init(target, video) {
    super.init()
    if (video) {
      this.videoId = SyncedYT.extractVideoIdFromURL(video)
    }
    this.target = target
    this._loadAPI()
  }

  _loadAPI() {
    var tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  onYouTubeIframeAPIReady() {
    console.log(this);

    this.frame = new YT.Player(this.target, {
      height: "390",
      width: "640",
      playerVars: {
        start: getVideoTime() + alpha,
        controls: 1,
      },
      videoId: this.videoId,
      events: {
        onReady: this.onPlayerReady.bind(this),
        onStateChange: this.onPlayerStateChange.bind(this)
      }
    });
    window.player = player;
  }

  async onPlayerReady() {
    await this.getVideoInfo()
  }

  onPlayerStateChange(event) {
    if (event.data === -1) {
      console.log("player ");

      if (this.first) {
        this.first = false
        console.log("First");

        let startPos = Math.ceil((this.videoTime / 1000 + alpha))
        console.log(startPos);

        this.frame.seekTo(startPos)

        setTimeout(() => {
          this.frame.seekTo(startPos)
          this.frame.pauseVideo()

        }, 1000);
        setTimeout(() => {
          this.frame.playVideo()
        }, Date.now() - this.serverTime + alpha * 1000 + this.epsilon)
      }
    }

  }

  async getVideoInfo(url) {
    await this.resync()
    let newVideo = url;
    let response = await axios.get("/", {
      params: {
        id: newVideo || null
      }
    });
    console.log(response);
    this.startedAt = await parseInt(response.headers["x-video-started-at"]);
    let videoId = this.videoId = extractVideoIdFromURL(newVideo)
    if (newVideo) {
      this.frame.loadVideoById(
        videoId,
        this.videoTime + alpha
      );
      this.first = true
    }
  }
  get videoTime() {
    console.log(this.serverTime, this.startedAt);

    return this.serverTime - this.startedAt
  }
  static extractVideoIdFromURL(URL) {
    const rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;

    let matches = URL.match(rx);

    if (matches) {
      return matches[1];
    }
    return "";
  }

}

let syncedPlayer = window.player = new SyncedYT()
var onYouTubeIframeAPIReady = syncedPlayer.onYouTubeIframeAPIReady
syncedPlayer.init("player")