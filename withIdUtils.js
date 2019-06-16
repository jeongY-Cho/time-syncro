const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.YOUTUBE_DATA_API_KEY;
const API_URL = "https://www.googleapis.com/youtube/v3/videos";

async function getVideoLength(id) {
  let response = await axios.get(API_URL, {
    params: {
      part: "contentDetails",
      key: API_KEY,
      id
    }
  });
  console.log(id);

  console.log(response.data);

  let time = response.data.items[0].contentDetails.duration;

  return parseDurationString(time);
}

function parseDurationString(durationString) {
  var stringPattern = /^PT(?:(\d+)D)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d{1,3})?)S)?$/;
  var stringParts = stringPattern.exec(durationString);
  return (
    (((stringParts[1] === undefined ? 0 : stringParts[1] * 1) /* Days */ * 24 +
      (stringParts[2] === undefined ? 0 : stringParts[2] * 1)) /* Hours */ *
      60 +
      (stringParts[3] === undefined ? 0 : stringParts[3] * 1)) /* Minutes */ *
      60 +
    (stringParts[4] === undefined ? 0 : stringParts[4] * 1) /* Seconds */
  );
}

module.exports = getVideoLength;
