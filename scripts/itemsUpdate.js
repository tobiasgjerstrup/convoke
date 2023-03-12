import convert from 'xml-js';
import axios from 'axios';
import mysql from 'mysql2';
import { database } from './config.js';
// create the connection to database
const connection = mysql.createConnection(database).promise()

async function insertValues(id, name, icon, timestamp) {
    console.log("DELETE FROM items WHERE id = " + id + ";")
    await connection.query("DELETE FROM items WHERE id = " + id + ";")
    console.log("insert into items values (" + id + ", \"" + name + "\", \"" + icon + "\", \"" + timestamp + "\")")
    await connection.query("insert into items values (" + id + ", \"" + name + "\", \"" + icon + "\", \"" + timestamp + "\")")
    return true
}
async function sqlQuery(query) {
    const result = await connection.query(query)
    return result[0];
}

const wowheadcall = (i) => axios.get('https://www.wowhead.com/item=' + i + '&xml', {})
    .then(function (response) {
        var string = convert.xml2json(response.data, {
            compact: true,
            space: 4
        });
        var json = JSON.parse(string)
        if (json.wowhead.hasOwnProperty('error')) return;
        insertValues(
            json.wowhead.item._attributes.id,
            json.wowhead.item.name._cdata.replaceAll('"', '\''),
            json.wowhead.item.icon._text,
            new Date().toISOString().slice(0, 10)
        )
        console.log('id: ' + json.wowhead.item._attributes.id + ' name: ' + json.wowhead.item.name._cdata.replaceAll('"', '\''))
    })

const value = await sqlQuery('SELECT * from items ORDER BY updated LIMIT 1')
console.log(value)
if (!Object.entries(value).length) {
    for (var i = 0; i < 3000000; i++) {
        const res = await wowheadcall(i);
    }
}
for (var i = value[0].id; i < 3000000; i++) {
    const res = await wowheadcall(i);
}

// connection.destroy(function (err) {
//     if (err) throw err;
// });
