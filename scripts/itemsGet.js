import * as libs from "./libs.js";

async function getAndPush(i) {
  const res = await libs.getWoWHeadXMLAsJSON("https://www.wowhead.com/item=" + i + "&xml");
  if (res) {
    const WoWHeadData = {
      id: res.wowhead.item._attributes.id, // ID
      name: res.wowhead.item.name._cdata.replaceAll('"', "'"), // NAME
      icon: res.wowhead.item.icon._text, // ICON
      class: res.wowhead.item.class._cdata, // CLASS
      subclass: res.wowhead.item.subclass._cdata, // SUBCLASS
      quality: res.wowhead.item.quality._attributes.id, // QUALITY
    };

    // CHECK DIFFS
    const DBData = await libs.select("production", "items", "where id = " + WoWHeadData.id);

    // ADD TO DB IF !EXIST
    if (DBData[0] === undefined) {
      await libs.deleteAndInsert(
        res.wowhead.item._attributes.id, // ID
        res.wowhead.item.name._cdata.replaceAll('"', "'"), // NAME
        res.wowhead.item.icon._text, // ICON
        res.wowhead.item.class._cdata, // CLASS
        res.wowhead.item.subclass._cdata, // SUBCLASS
        res.wowhead.item.quality._attributes.id // QUALITY
      );
      console.log("ran deleteAndInsert on: " + res.wowhead.item._attributes.id + " " + res.wowhead.item.name._cdata);
      return true;
    }

    // IF DIFFS
    if ((DBData[0].quality !== null) && (DBData[0].name === WoWHeadData.name && DBData[0].icon === WoWHeadData.icon && DBData[0].class === WoWHeadData.class && DBData[0].subclass === WoWHeadData.subclass && DBData[0].quality.toString() === WoWHeadData.quality)) {
      console.log("this is the same on wowhead & DB: " + res.wowhead.item._attributes.id + " " + res.wowhead.item.name._cdata);
      return true;
    } else {
      await libs.updateTable("production", "items", i, `name = "${WoWHeadData.name}", icon = "${WoWHeadData.icon}", class = "${WoWHeadData.class}", subclass = "${WoWHeadData.subclass}", quality = ${WoWHeadData.quality}`);
      console.log("ran updateTable on: " + res.wowhead.item._attributes.id + " " + res.wowhead.item.name._cdata);
      return true;
    }
  } else {
    console.log("item with ID " + i + " was not found");
    return false;
  }
}

const startIndex = 0;

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
