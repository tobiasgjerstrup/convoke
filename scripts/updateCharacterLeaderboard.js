import * as libs from "./libs.js";
import { blizzardClient } from "./config.js";

const verifyOnly = false;

let name = "".toLowerCase();
let realm = "".toLowerCase().split(" ").join("-").split("'").join("");
let region = "".toLowerCase();

const characters = [
  { name: "convoke", realm: "Quelthalas", region: "EU" },
  { name: "Dìspy", realm: "azjolnerub", region: "EU" },
];

let petScore = 0;
let pets = 0;
let mounts = 0;
let toys = 0;
const accessToken = await libs.credentialAuthPost(`https://oauth.battle.net/token`, blizzardClient.client_id, blizzardClient.client_secret);
if (accessToken === false) {
  console.error("bad access token");
  process.exit(0);
}

for (let charIndex = 0; charIndex < characters.length; charIndex++) {
  region = characters[charIndex].region.toLowerCase();
  realm = characters[charIndex].realm.toLowerCase().split(" ").join("-").split("'").join("");
  name = characters[charIndex].name.toLowerCase();

  const petData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/pets?namespace=profile-${region}`, accessToken.access_token);
  if (petData !== undefined) {
    pets = petData.pets.length;
    for (let i = 0; i < petData.pets.length; i++) {
      switch (petData.pets[i].quality.type) {
        case "POOR":
          petScore += petData.pets[i].level * 1;
          break;
        case "COMMON":
          petScore += petData.pets[i].level * 2;
          break;
        case "UNCOMMON":
          petScore += petData.pets[i].level * 3;
          break;
        case "RARE":
          petScore += petData.pets[i].level * 4;
          break;
        default:
          console.error(petData.pets[i].quality.type + " is not a valid quality for pets");
          break;
      }
    }
  }

  const mountData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/mounts?namespace=profile-${region}`, accessToken.access_token);
  if (mountData !== undefined) {
    mounts = mountData.mounts.length;
  }
  const toyData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/collections/toys?namespace=profile-${region}`, accessToken.access_token);
  if (toyData !== undefined) {
    toys = toyData.toys.length;
  }

  if (verifyOnly) {
    console.log(region, realm, name, 0, 0, mounts, pets, petScore, toys, 0, 0, 0, 0, 0, 0, new Date());
  } else {
    await libs.insert("test", "wow_leaderboard", region, realm, name, 0, 0, mounts, pets, petScore, 0, 0, 0, 0, 0, 0, 0, new Date());
  }
}
// console.log(await libs.select("test", "wow_leaderboard"));

libs.stopScript();
