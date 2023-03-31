import * as libs from "./libs.js";

const data = await libs.select("production", "items");

await libs.clearTable('test', 'items')

for (let i = 0; i < data.length; i++) {
  await libs.insert('test', "items", data[i].id, data[i].name, data[i].icon, data[i].updated, data[i].class, data[i].subclass);
}

console.log("script finished");
process.exit(0);
