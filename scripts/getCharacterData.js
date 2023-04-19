import * as libs from "./libs.js";
import axios from "axios";
import fs from "fs";
import { databaseTest, databaseProduction } from "./config.js";
import mysql from "mysql2";
import convert from "xml-js";

const name = "Gaulish".toLowerCase();
const realm = "YSERA".toLowerCase().split(" ").join("-").split("'").join("");
const region = "EU".toLowerCase();

// DELETE DATA FROM TEST
await libs.clearTable("test", "characters", `WHERE name = '${name}'`);
await libs.clearTable("test", "collections", `WHERE name = '${name}'`);

// character
const characterData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}?namespace=profile-${region}`, "EUyBWDW2g09mN6ALWug43bUDPzYlP34Y74");
await libs.insert("test", "characters", characterData.id, characterData.name, characterData.realm.name.en_US, new Date().toISOString().slice(0, 10));
console.log(" Inserted: " + characterData.id + " " + characterData.name);

// COLLECTIONS
// pets
const petData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/pets?namespace=profile-${region}`, "EUyBWDW2g09mN6ALWug43bUDPzYlP34Y74");
let customPetName = "";
for (let i = 0; i < petData.pets.length; i++) {
  if (Object.prototype.hasOwnProperty.call(petData.pets[i], "name")) customPetName = petData.pets[i].name;
  else customPetName = "";
  await libs.insert("test", "collections", characterData.id, characterData.name, characterData.realm.name.en_US, petData.pets[i].species.id, petData.pets[i].species.name.en_US, "pet", Object.prototype.hasOwnProperty.call(petData.pets[i], "is_favorite"), customPetName);
}
// mounts
const mountData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/mounts?namespace=profile-${region}`, "EUyBWDW2g09mN6ALWug43bUDPzYlP34Y74");
for (let i = 0; i < mountData.mounts.length; i++) {
  await libs.insert("test", "collections", characterData.id, characterData.name, characterData.realm.name.en_US, mountData.mounts[i].mount.id, mountData.mounts[i].mount.name.en_US, "mount", Object.prototype.hasOwnProperty.call(mountData.mounts[i], "is_favorite"), '');
}
// heirlooms
const heirloomData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/heirlooms?namespace=profile-${region}`, "EUyBWDW2g09mN6ALWug43bUDPzYlP34Y74");
for (let i = 0; i < heirloomData.heirlooms.length; i++) {
  await libs.insert("test", "collections", characterData.id, characterData.name, characterData.realm.name.en_US, heirloomData.heirlooms[i].heirloom.id, heirloomData.heirlooms[i].heirloom.name.en_US, "heirloom", Object.prototype.hasOwnProperty.call(heirloomData.heirlooms[i], "is_favorite"), '');
}
// toys
const toyData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/toys?namespace=profile-${region}`, "EUyBWDW2g09mN6ALWug43bUDPzYlP34Y74");
for (let i = 0; i < toyData.toys.length; i++) {
  await libs.insert("test", "collections", characterData.id, characterData.name, characterData.realm.name.en_US, toyData.toys[i].toy.id, toyData.toys[i].toy.name.en_US, "toy", Object.prototype.hasOwnProperty.call(toyData.toys[i], "is_favorite"), '');
}

libs.stopScript();
