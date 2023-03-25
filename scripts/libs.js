import axios from "axios";
import fs from "fs";
import { database } from "./config.js";
import mysql from "mysql2";
import convert from "xml-js";

const connection = mysql.createConnection(database).promise();

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
    console.error("call: " + url + " failed with error code: " + response.status);
    return response.status;
  }
  console.error("call: " + url + " status: " + response.status);
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return response.data;
}

export async function deleteAndInsert(id, name, icon, timestamp) {
  await connection.query("DELETE FROM items WHERE id = " + id + ";");
  await connection.query("insert into items values (" + id + ', "' + name + '", "' + icon + '", "' + timestamp + '")');
  return true;
}

export async function getWoWHeadXMLAsJSON(url) {
  const response = await axios({
    url,
    method: "GET",
  });
  const string = convert.xml2json(response.data, {
    compact: true,
    space: 4,
  });
  const json = JSON.parse(string);
  if (json.wowhead.hasOwnProperty("error")) return false;
  return json;
}

export async function sqlQuery(query) {
  const result = await connection.query(query);
  return result[0];
}
