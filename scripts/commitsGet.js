import mysql from 'mysql2';
import { database } from './config.js';
import axios from 'axios';

const connection = mysql.createConnection(database).promise()

await connection.query("delete from gitCommits")

const getCommits = () => axios.get(' https://api.github.com/repos/tobiasgjerstrup/convoke/commits', {})
    .then(function (response) {
        let commits = []
        for (var i = 0; i < response.data.length; i++) {
            commits.push(response.data[i].url)
        }
        return commits
    });

const getCommitData = (url) => axios.get(url, {})
    .then(function (response) {
        return {
            name: response.data.committer.login,
            date: response.data.commit.author.date,
            message: response.data.commit.message,
            url: response.data.html_url,
            deletions: response.data.stats.deletions,
            additions: response.data.stats.additions,
            changed_files: response.data.files.length
        }
    });


const res = await getCommits();

for (var i = 0; i < res.length; i++) {
    let data = await getCommitData(res[i])
    await connection.query("insert into gitCommits values ('" + data.name + "', '" + data.date.replace("T", " ").replace("Z", "") + "', '" + data.message.replaceAll("'", "\"") + "', '" + data.url + "', " + data.additions + ", " + data.deletions + ", " + data.changed_files + ")")
}

connection.destroy();
