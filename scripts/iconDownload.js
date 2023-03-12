import fs from 'fs'
import request from 'request';
import mysql from 'mysql2';
import { database } from './config.js';

const connection = mysql.createConnection(database).promise()

async function sqlQuery(query) {
    const result = await connection.query(query)
    return result[0];
}

const values = await sqlQuery('select distinct icon from items order by icon')

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function download(uri, filename) {
    request(uri).pipe(fs.createWriteStream(filename))
};

for (var i = 0; i < values.length; i++) {
    download('https://wow.zamimg.com/images/wow/icons/large/' + values[i].icon + '.jpg', './output/' + values[i].icon + '.jpg')
    await sleep(200);
}

connection.destroy(function (err) {
    if (err) throw err;
});
