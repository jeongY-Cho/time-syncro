let delta;
let startTime;
let startPos;
window.starTime = startTime;
window.startPos = startPos;

let ping = document.getElementById("ping");
let box = document.getElementById("box");
let getServerTime = () => {
  return Date.now() - delta;
};
async function getStartTimeAndPos() {
  let response = await axios.get("proof/sync");

  startTime = parseInt(response.headers["x-start-at"]);
  startPos = parseInt(response.headers["x-start-pos"]);
}
async function getAverageDelta() {
  let span = document.getElementById("delay");
  span.innerText = "starting measurement";
  let deltas = [];

  for (_ = 0; _ < 5; _++) {
    deltas.push(await getDelta());
  }
  console.log(deltas);

  let avgDelta = mean(deltas);
  let sdDeltas = Math.floor(Math.sqrt(variance(deltas)));

  ping.innerHTML +=
    "<br>avgDelta: " + avgDelta + "<br>SD: " + sdDeltas + "<br>";
  if (sdDeltas > 10) {
    getAverageDelta();
  } else {
    delta = avgDelta;
    span.innerText = `${avgDelta}, SD: ${sdDeltas}`;
    await getStartTimeAndPos();
    return avgDelta;
  }
}
function changeColor(what) {
  box.innerText = "synced box " + getServerTime();
  if (what.style.background === "red") {
    what.style.background = "blue";
  } else {
    what.style.background = "red";
  }
  setTimeout(changeColor, 1000, what);
}

async function getDelta() {
  var t0 = Date.now();
  let response = await axios.get("/time");
  let t1 = Date.now();
  console.log(t1 - t0);

  ping.innerHTML += `<br>Ping: ${t1 - t0}`;

  return t1 - response.data - (t1 - t0) / 2;
}
function setChangeColor() {
  setTimeout(changeColor, startTime - getServerTime(), box);
}

async function setNew() {
  await axios.put("proof/set", {
    data: {
      videoId: document.getElementById("newId").value,
      videoLength: document.getElementById("length").value
    }
  });
  setTimeout(() => {
    console.log(Date.now());
    location.reload();
  }, 300);
}

//Check whether is a number or not
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
//calculate the mean of a number array
function mean(arr) {
  var len = 0;
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == "") {
    } else if (!isNum(arr[i])) {
      alert(arr[i] + " is not number!");
      return;
    } else {
      len = len + 1;
      sum = sum + parseFloat(arr[i]);
    }
  }
  return sum / len;
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
