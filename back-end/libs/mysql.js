import { insert } from "../../scripts/libs.js";
import { database } from "../config.js";
import mysql from "mysql2";

const connection = mysql.createConnection(database).promise();

export async function INSERT(table, insertObject) {
  let keys = "";
  let values = "";

  for (const [key, value] of Object.entries(insertObject)) {
    keys += `\`${key}\`,`;
    if (typeof value === "string") values += `'${value.replaceAll("'", "''")}',`;
    else values += `'${value}',`;
  }

  keys = keys.slice(0, -1);
  values = values.slice(0, -1);

  const response = await connection.query(`insert into ${table} (${keys}) VALUES (${values})`);

  return true;
}

export async function SELECT(table, insertObject = {}, fieldsObject = {}) {
  let response;
  let condition = "";
  let fields = "";

  for (const [key, value] of Object.entries(insertObject)) {
    condition += `\`${key}\``;
    if (typeof value !== "string") condition += ` = '${value}' AND `;
    else condition += ` = '${value.replaceAll("'", "''")}' AND `;
  }

  for (const [key, value] of Object.entries(fieldsObject)) {
    if (value === true) fields = fields + `${key}, `;
  }

  if (fields === "") {
    fields = "*";
  } else {
    fields = fields.slice(0, -2);
  }

  condition = condition.slice(0, -5);
  let WHERE = "";
  if (condition) WHERE = "WHERE";
  response = await connection.query(`SELECT ${fields} FROM ${table} ${WHERE} ${condition}`);
  return response;
}

export async function SELECTAll(table, insertObject) {
  let response;
  let condition = "";

  for (const [key, value] of Object.entries(insertObject)) {
    condition += `\`${key}\``;
    if (typeof value === "number") condition += ` = '${value}' OR `;
    else condition += ` = '${value.replaceAll("'", "''")}' OR `;
  }
  condition = condition.slice(0, -4);
  let WHERE = "";
  if (condition) WHERE = "WHERE";
  response = await connection.query(`SELECT * FROM ${table} ${WHERE} ${condition}`);
  return response;
}

export async function UPDATE(table, insertObject) {
  let insertString = "";

  for (const [key, value] of Object.entries(insertObject)) {
    insertString += `\`${key}\` = `;
    if (typeof value !== "string") insertString += `'${value}',`;
    else insertString += `'${value.replaceAll("'", "''")}',`;
  }

  insertString = insertString.slice(0, -1);
  const response = await connection.query(`UPDATE ${table} SET ${insertString} WHERE id = ${insertObject.id}`);

  if (response[0].affectedRows !== 1) {
    return { statuscode: 500, message: "something went wrong when updating playlist. " + `UPDATE ${table} SET ${insertString} WHERE id = ${insertObject.id}` };
  }
  return { statuscode: 200, message: "updated playlist successfully" };
}

export async function DELETE(db, table, insertObject) {
  let condition = "";

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
    default:
      break;
  }
  return true;
}
