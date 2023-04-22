import * as libs from "./libs.js";

// GET DATA FROM PRODUCTION
const itemsData = await libs.select("production", "items");
const gitCommitsData = await libs.select("production", "gitCommits");

// DELETE DATA FROM TEST
await libs.clearTable("test", "items");
await libs.clearTable("test", "gitCommits");

// SEED TEST WITH DATA FROM PRODUCTION
// items
for (let i = 0; i < itemsData.length; i++) {
  await libs.insert("test", "items", itemsData[i].id, itemsData[i].name, itemsData[i].icon, itemsData[i].updated, itemsData[i].class, itemsData[i].subclass, itemsData[i].quality);
  console.log(" Inserted: " + itemsData[i].id + " " + itemsData[i].name);
}
// gitCommits
for (let i = 0; i < gitCommitsData.length; i++) {
  await libs.insert("test", "gitCommits", gitCommitsData[i].name, gitCommitsData[i].date, gitCommitsData[i].message, gitCommitsData[i].url, gitCommitsData[i].additions, gitCommitsData[i].deletions, gitCommitsData[i].changed_files);
  console.log(" Inserted: " + gitCommitsData[i].message + " " + gitCommitsData[i].url);
}

// FINISH SCRIPT
console.log("script finished");
process.exit(0);
