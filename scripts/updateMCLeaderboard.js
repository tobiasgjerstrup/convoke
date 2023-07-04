import * as libs from "./libs.js";
import fs from "fs/promises";

// const players = await libs.select("production", "mc_players");

const mcWorldDir = "../../minecraft-server/world-1.20/stats/";

async function updateMCLeaderboard() {
  const files = await fs.readdir(mcWorldDir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const data = await fs.readFile(mcWorldDir + file, "utf8");
    if (undefined !== JSON.parse(data).stats) {
      const stats = JSON.parse(data).stats;
      let blocksMined = 0;
      let mobsKilled = 0;
      let timePlayed = 0;
      let itemsBroken = 0;
      let itemsDropped = 0;
      let itemsPickedUp = 0;
      let itemsUsed = 0;
      let itemsCrafted = 0;
      if (stats["minecraft:mined"] !== undefined) {
        Object.keys(stats["minecraft:mined"]).forEach(function (stat) {
          blocksMined += stats["minecraft:mined"][stat];
        });
      }
      if (stats["minecraft:killed"] !== undefined) {
        Object.keys(stats["minecraft:killed"]).forEach(function (stat) {
          mobsKilled += stats["minecraft:killed"][stat];
        });
      }
      if (stats["minecraft:broken"] !== undefined) {
        Object.keys(stats["minecraft:broken"]).forEach(function (stat) {
          itemsBroken += stats["minecraft:broken"][stat];
        });
      }
      if (stats["minecraft:dropped"] !== undefined) {
        Object.keys(stats["minecraft:dropped"]).forEach(function (stat) {
          itemsDropped += stats["minecraft:dropped"][stat];
        });
      }
      if (stats["minecraft:picked_up"] !== undefined) {
        Object.keys(stats["minecraft:picked_up"]).forEach(function (stat) {
          itemsPickedUp += stats["minecraft:picked_up"][stat];
        });
      }
      if (stats["minecraft:used"] !== undefined) {
        Object.keys(stats["minecraft:used"]).forEach(function (stat) {
          itemsUsed += stats["minecraft:used"][stat];
        });
      }
      if (stats["minecraft:crafted"] !== undefined) {
        Object.keys(stats["minecraft:crafted"]).forEach(function (stat) {
          itemsCrafted += stats["minecraft:crafted"][stat];
        });
      }
      if (stats["minecraft:custom"] !== undefined && stats["minecraft:custom"]["minecraft:play_time"] !== undefined) {
        timePlayed += stats["minecraft:custom"]["minecraft:play_time"];
        timePlayed = (timePlayed / 20 / 60 / 60).toFixed(2)
      }
      const res = await libs.updateTable("production", "mc_players", "'" + file.slice(0, -5) + "'", `blocks_mined = ${blocksMined}, mobs_killed = ${mobsKilled}, time_played = ${timePlayed}, items_broken = ${itemsBroken}, items_dropped = ${itemsDropped}, items_picked_up = ${itemsPickedUp}, items_used = ${itemsUsed}, items_crafted = ${itemsCrafted}`);
      if (res.affectedRows < 1) {
        await libs.sqlQuery(`INSERT INTO mc_players (id, blocks_mined, mobs_killed, time_played, items_broken, items_dropped, items_picked_up, items_used, items_crafted) VALUES ('${file.slice(0, -5)}', ${blocksMined}, ${mobsKilled}, ${timePlayed}, ${itemsBroken}, ${itemsDropped}, ${itemsPickedUp}, ${itemsUsed}, ${itemsCrafted})`);
      }
    }
  }
}

await updateMCLeaderboard();
libs.stopScript();
