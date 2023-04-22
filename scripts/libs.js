import axios from "axios";
import fs from "fs";
import { databaseTest, databaseProduction } from "./config.js";
import mysql from "mysql2";
import convert from "xml-js";

const connection = mysql.createConnection(databaseProduction).promise();
const connectionTest = mysql.createConnection(databaseTest).promise();

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
  console.log("call: " + url + " status: " + response.status);
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return response.data;
}

export async function deleteAndInsert(id, name, icon, timestamp, _class, subclass, quality) {
  await connection.query("DELETE FROM items WHERE id = " + id + ";");
  await connection.query("insert into items values (" + id + ', "' + name + '", "' + icon + '", "' + timestamp + '", "' + _class + '", "' + subclass + '", "' + quality + '")');
  return true;
}

export async function insert(db, table, ...args) {
  const arguements = args;
  switch (db) {
    case "test":
      await connectionTest.query(`insert into ${table} VALUES (?)`, [arguements]);
      break;
    case "production":
      await connection.query(`insert into ${table} VALUES (?)`, [arguements]);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}

export async function select(db, table, ...args) {
  let response;
  switch (db) {
    case "test":
      response = await connectionTest.query(`select * from ${table} ${args}`);
      break;
    case "production":
      response = await connection.query(`select * from ${table} ${args}`);
      break;
    default:
      console.log("no valid db selected");
      return false;
  }

  return response[0];
}

export async function delete_(db, table, coloumn, value) {
  switch (db) {
    case "test":
      await connectionTest.query(`DELETE FROM ${table} WHERE ${coloumn} = ${value}`);
      break;
    case "production":
      await connection.query(`DELETE FROM ${table} WHERE ${coloumn} = ${value}`);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}

export async function clearTable(db, table, condition = '') {
  switch (db) {
    case "test":
      await connectionTest.query(`DELETE FROM ${table} ${condition}`);
      break;
    case "production":
      await connection.query(`DELETE FROM ${table} ${condition}`);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}

export async function getJsonFromURL(url) {
  const response = await axios({
    url,
    method: "GET",
    validateStatus: false,
  });
  if (response.status !== 200) {
    console.error("call: " + url + " failed with error code: " + response.status);
    return false;
  }
  console.log("call: " + url + " status: " + response.status);
  return response.data;
}

export async function getWoWHeadXMLAsJSON(url) {
  const response = await axios({
    url,
    method: "GET",
    validateStatus: false,
  });
  if (response.status !== 200) {
    console.error("call " + url + " failed with status code " + response.status);
    return false;
  }
  const string = convert.xml2json(response.data, {
    compact: true,
    space: 4,
  });
  const json = JSON.parse(string);
  if (Object.prototype.hasOwnProperty.call(json.wowhead, "error")) return false;
  return json;
}

export async function sqlQuery(query) {
  const result = await connection.query(query);
  return result[0];
}

export async function stopScript() {
  connection.destroy();
  console.log("script finished");
  process.exit(0);
}

export async function zeroAuthGet(url, accessToken) {
  const response = await axios({
    url,
    method: "GET",
    validateStatus: false,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status !== 200) {
    console.error("call " + url + " failed with status code " + response.status);
    return false;
  }
  return response.data;
}