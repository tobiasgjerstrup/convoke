import mysql from "mysql2";
import { database } from "./config.js";
import * as libs from "./libs.js";

const connection = mysql.createConnection(database).promise();

await connection.query("delete from gitCommits");

async function getCommits() {
  const response = await libs.getJsonFromURL("https://api.github.com/repos/tobiasgjerstrup/convoke/commits?per_page=100");
  if (!response) {
    console.log("script failed getting commits.");
    return false;
  }
  const commits = [];
  for (let i = 0; i < response.length; i++) {
    commits.push(response[i].url);
  }
  return commits;
}

async function getCommitData(url) {
  const response = await libs.getJsonFromURL(url);
  if (!response) {
    console.log("script failed getting commits.");
    return false;
  }
  return modifyData(response);
}

function modifyData(response) {
  const data = {
    name: response.author.login,
    date: response.commit.author.date,
    message: response.commit.message,
    url: response.html_url,
    deletions: response.stats.deletions,
    additions: response.stats.additions,
    changed_files: response.files.length,
  };

  data.date = data.date.replace("T", " ").replace("Z", "");
  data.message = data.message.replaceAll("'", '"');

  if (response.files) {
    response.files.forEach((element) => {
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
for (let i = 0; i < res.length; i++) {
  const data = await getCommitData(res[i]);
  if (!data) continue;
  await connection.query("insert into gitCommits values ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
  console.log("inserted into DB: ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
}

connection.destroy();
console.log("script finished");
process.exit(0);
