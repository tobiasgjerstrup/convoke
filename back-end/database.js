import mysql from 'mysql';
import * as http from 'http';
import * as util from 'util';
import { database } from './config.js';
import * as libs from './libs.js';

var conn = mysql.createConnection(database);

const query = util.promisify(conn.query).bind(conn);

let result = async function (sql) {
    var userCourse = [];
    try {
        const rows = await query(sql);
        userCourse = rows;
    } finally {
        return userCourse;
    }
};
http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    let call = req.url.replaceAll('%20', ' ').split('/')
    let tmp = req.url.replaceAll('%20', ' ').split('$')
    let params = libs.getParams(tmp)

    if (call[1] !== 'api' || call[2] !== 'v1') {
        return;
    }

    let sql = libs.call(call, params);
    console.log(sql);
    result(sql).then(value => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(JSON.stringify(value).replace('[{"count(*)":', '[{"count":'));
        res.end();
    });
}).listen(8080);