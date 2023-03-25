import mysql from "mysql2";
import { database } from "./config.js";
import axios from "axios";
import * as libs from "./libs.js";

const connection = mysql.createConnection(database).promise();

await connection.query("delete from gitCommits");

async function getCommits() {
  const response = await libs.getJsonFromURL("https://api.github.com/repos/tobiasgjerstrup/convoke/commits");
  if (response !== 200) {
    console.log("script failed getting commits. Status: " + response);
    return false;
  }
  let commits = [];
  for (var i = 0; i < response.length; i++) {
    commits.push(response[i].url);
  }
  return commits;
}

async function getCommitData(url) {
  const response = await libs.getJsonFromURL(url);
  if (response !== 200) {
    console.log("script failed getting commits. Status: " + response);
    return false;
  }
  return modifyData(response);
}

function modifyData(response) {
  let data = {
    name: response.data.author.login,
    date: response.data.commit.author.date,
    message: response.data.commit.message,
    url: response.data.html_url,
    deletions: response.data.stats.deletions,
    additions: response.data.stats.additions,
    changed_files: response.data.files.length,
  };

  data.date = data.date.replace("T", " ").replace("Z", "");
  data.message = data.message.replaceAll("'", '"');

  if (response.data.files) {
    response.data.files.forEach((element) => {
      if (element.filename.includes("package-lock.json")) {
        data.deletions -= element.deletions;
        data.additions -= element.additions;
      }
    });
  }
  return data;
}

const res = await getCommits();
if (!res) {
  console.log("function getCommits failed");
  process.exit(1);
}
for (var i = 0; i < res.length; i++) {
  let data = await getCommitData(res[i]);
  if (!data) continue;
  await connection.query("insert into gitCommits values ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
  console.log("inserted into DB: ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
}

connection.destroy();
console.log("script finished");
process.exit(0);
