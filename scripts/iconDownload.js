import mysql from "mysql2";
import { database, paths } from "./config.js";
import * as libs from "./libs.js";

const connection = mysql.createConnection(database).promise();

async function sqlQuery(query) {
  const result = await connection.query(query);
  return result[0];
}

const values = await sqlQuery("select distinct icon from items order by icon");

for (let i = 0; i < values.length; i++) {
  await libs.downloadImage("https://wow.zamimg.com/images/wow/icons/large/" + values[i].icon + ".jpg", paths.imageOutputPath + values[i].icon + ".jpg");
}

connection.destroy(function (err) {
  if (err) throw err;
});
console.log("script finished");
process.exit(0);
