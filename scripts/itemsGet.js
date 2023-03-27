import * as libs from "./libs.js";

async function getAndPush(i) {
  const res = await libs.getWoWHeadXMLAsJSON("https://www.wowhead.com/item=" + i + "&xml");
  if (res) {
    await libs.deleteAndInsert(
      res.wowhead.item._attributes.id, // ID
      res.wowhead.item.name._cdata.replaceAll('"', "'"), // NAME
      res.wowhead.item.icon._text, // ICON
      new Date().toISOString().slice(0, 10), // DATABASE UPDATED TIME
      res.wowhead.item.class._cdata, // CLASS
      res.wowhead.item.subclass._cdata // SUBCLASS
    );
    console.log(new Date().toISOString() + " " + res.wowhead.item._attributes.id + " " + res.wowhead.item.name._cdata);
    return true;
  } else {
    console.log(new Date().toISOString() + " " + "item with ID " + i + " was not found");
    return false;
  }
}

const value = await libs.sqlQuery("SELECT * from items ORDER BY updated LIMIT 1");
console.log(value);

let startIndex = 0;

if (Object.entries(value).length) {
  startIndex = value[0].id;
}

let lastAcceptedValue = 1000000;

for (let i = startIndex; i < 1000000; i++) {
  const response = await getAndPush(i);
  if (response) {
    lastAcceptedValue = i;
  } else {
    if (i > lastAcceptedValue + 10000) {
      // if we havent found an item in the past 10k lookups finish script
      console.log("script finished");
      process.exit(0);
    }
  }
}

console.log("script finished");
process.exit(0);
