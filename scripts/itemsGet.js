import * as libs from "./libs.js";

async function getAndPush(i) {
  const res = await libs.getWoWHeadXMLAsJSON("https://www.wowhead.com/item=" + i + "&xml");
  if (res) {
    libs.deleteAndInsert(res.wowhead.item._attributes.id, res.wowhead.item.name._cdata.replaceAll('"', "'"), res.wowhead.item.icon._text, new Date().toISOString().slice(0, 10));
    console.log(res.wowhead.item._attributes.id + " " + res.wowhead.item.name._cdata);
  } else {
    console.error("item with ID " + i + " was not found");
  }
}

const value = await libs.sqlQuery("SELECT * from items ORDER BY updated LIMIT 1");
console.log(value);
if (!Object.entries(value).length) {
  for (let i = 0; i < 300000; i++) {
    await getAndPush(i);
  }
}

for (let i = value[0].id; i < 300000; i++) {
  await getAndPush(i);
}
process.exit(0);
