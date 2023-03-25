import axios from "axios";
import fs from "fs";

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function downloadImage(url, path) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    validateStatus: false,
  });
  if (response.status !== 200) {
    console.log("call: " + url + " failed with error code: " + response.status);
    return response.status;
  }
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return response.data;
}
