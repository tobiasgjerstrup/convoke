import mysql from "mysql2";
import { database } from "./config.js";
import axios from "axios";

const connection = mysql.createConnection(database).promise();

await connection.query("delete from gitCommits");

const getCommits = () =>
  axios.get(" https://api.github.com/repos/tobiasgjerstrup/convoke/commits", {}).then(function (response) {
    let commits = [];
    for (var i = 0; i < response.data.length; i++) {
      commits.push(response.data[i].url);
    }
    return commits;
  });

const getCommitData = (url) =>
  axios.get(url, {}).then(function (response) {
    return modifyData(response);
  });

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

for (var i = 0; i < res.length; i++) {
  let data = await getCommitData(res[i]);
  await connection.query("insert into gitCommits values ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
  console.log("inserted into DB: ('" + data.name + "', '" + data.date + "', '" + data.message + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")");
}

connection.destroy();
