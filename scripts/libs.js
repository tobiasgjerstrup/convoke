import axios from "axios";
import fs from "fs";
import { databaseTest, databaseProduction, databaseLogs } from "./config.js";
import mysql from "mysql2";
import convert from "xml-js";

const connection = mysql.createConnection(databaseProduction).promise();
const connectionTest = mysql.createConnection(databaseTest).promise();
const connectionLogs = mysql.createConnection(databaseLogs).promise();

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

export async function deleteAndInsert(id, name, icon, _class, subclass, quality) {
  await connection.query("DELETE FROM items WHERE id = " + id + ";");
  await connection.query("insert into items values (" + id + ', "' + name + '", "' + icon + '", "' + _class + '", "' + subclass + '", "' + quality + '", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)');
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
    case "logs":
      await connectionLogs.query(`insert into ${table} VALUES (?)`, [arguements]);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}

export async function insertv2(db, table, insertObject) {
  let keys = "";
  let values = "";

  for (const [key, value] of Object.entries(insertObject)) {
    keys += `\`${key}\`,`;
    values += `'${value}',`;
  }

  keys = keys.slice(0, -1);
  values = values.slice(0, -1);
  switch (db) {
    case "test":
      await connectionTest.query(`insert into ${table} (${keys}) VALUES (${values})`);
      break;
    case "production":
      await connection.query(`insert into ${table} (${keys}) VALUES (${values})`);
      break;
    case "logs":
      await connectionLogs.query(`insert into ${table} (${keys}) VALUES (${values})`);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}

export async function select(db, table, ...args) {
  let response;
  console.log(`select * from ${table} ${args}`);
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
export async function count(db, table, ...args) {
  let response;
  switch (db) {
    case "test":
      response = await connectionTest.query(`select COUNT(*) as count from ${table} ${args}`);
      break;
    case "production":
      response = await connection.query(`select COUNT(*) as count from ${table} ${args}`);
      break;
    default:
      console.log("no valid db selected");
      return false;
  }

  return response[0][0];
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

export async function clearTable(db, table, condition = "") {
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

export async function updateTable(db, table, id, ...args) {
  let response;
  switch (db) {
    case "test":
      response = await connectionTest.query(`UPDATE ${table} SET ${args} WHERE id = ${id}`);
      break;
    case "production":
      response = await connection.query(`UPDATE ${table} SET ${args} WHERE id = ${id}`);
      break;
    default:
      console.log("no valid db selected");
      return false;
  }

  return response[0];
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

export async function credentialAuthPost(URL, USERNAME, PASSWORD) {
  const response = await axios({
    url: URL,
    method: "POST",
    validateStatus: false,
    data: "grant_type=client_credentials",
    auth: {
      username: USERNAME,
      password: PASSWORD,
    },
  });
  if (response.status !== 200) {
    console.log(response.data);
    console.error("call " + URL + " failed with status code " + response.status);
    return false;
  }
  return response.data;
}

async function insertLog(keys, values) {
  await connectionLogs.query(`insert into log (${keys}) VALUES (${values})`);
}

export async function logMessage(message, errorCode, args = null) {
  let insertObject = {};
  if (args !== null) {
    insertObject = Object.assign({}, { LogTimestamp: new Date().toISOString().slice(0, 19).replace("T", " "), LogMessage: message, ErrorCode: errorCode }, args);
  } else {
    insertObject = { LogTimestamp: new Date().toISOString().slice(0, 19).replace("T", " "), LogMessage: message, ErrorCode: errorCode };
  }
  let keys = ``;
  let values = ``;
  for (const [key, value] of Object.entries(insertObject)) {
    keys += `\`${key}\`,`;
    values += `'${value.replaceAll("", "''")}',`;
  }
  keys = keys.slice(0, -1);
  values = values.slice(0, -1);
  await insertLog(keys, values);
}

export async function logError(message, errorCode, args = null) {
  let insertObject = {};
  if (args !== null) {
    insertObject = Object.assign({}, { LogTimestamp: new Date().toISOString().slice(0, 19).replace("T", " "), LogMessage: message, ErrorCode: errorCode }, args);
  } else {
    insertObject = { LogTimestamp: new Date().toISOString().slice(0, 19).replace("T", " "), LogMessage: message, ErrorCode: errorCode };
  }
  if (insertObject.ErrorMessage === undefined) {
    insertObject.ErrorMessage = message;
  }
  let keys = ``;
  let values = ``;
  for (const [key, value] of Object.entries(insertObject)) {
    keys += `\`${key}\`,`;
    values += `'${value}',`;
  }
  keys = keys.slice(0, -1);
  values = values.slice(0, -1);
  await insertLog(keys, values);
}

export async function deletev2(db, table, insertObject) {
  
  let condition = ''

  for (const [key, value] of Object.entries(insertObject)) {
    condition += `\`${key}\``;
    condition += ` = '${value}' AND `;
  }
  condition = condition.slice(0, -5);
  switch (db) {
    case "test":
      await connectionTest.query(`DELETE FROM ${table} WHERE ${condition}`);
      break;
    case "production":
      await connection.query(`DELETE FROM ${table} WHERE ${condition}`);
      break;
    case "logs":
      await connectionLogs.query(`DELETE FROM ${table} WHERE ${condition}`);
      break;
    default:
      console.log("no valid db selected");
      break;
  }
  return true;
}