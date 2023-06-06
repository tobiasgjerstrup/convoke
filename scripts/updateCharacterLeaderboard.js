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

const accessToken = await libs.credentialAuthPost(`https://oauth.battle.net/token`, blizzardClient.client_id, blizzardClient.client_secret);
if (accessToken === false) {
  console.error("bad access token");
  process.exit(0);
}

for (let charIndex = 0; charIndex < characters.length; charIndex++) {
  let petScore = 0;
  let pets = 0;
  let mounts = 0;
  let toys = 0;
  let achievementPoints = 0;
  let reputations = 0;
  let titles = 0;
  let questsCompleted = 0;
  let honorableKills = 0;
  let honorLvl = 0;

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
  const characterData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}?namespace=profile-${region}`, accessToken.access_token);
  if (characterData !== undefined) {
    achievementPoints = characterData.achievement_points;
  }
  const reputationData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/reputations?namespace=profile-${region}`, accessToken.access_token);
  if (reputationData !== undefined) {
    reputationData.reputations.forEach((rep) => {
      if (rep.standing.max === 0) {
        reputations++;
      }
    });
  }
  const titlesData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/titles?namespace=profile-${region}`, accessToken.access_token);
  if (titlesData !== undefined) {
    titlesData.titles.forEach((rep) => {
      titles++;
    });
  }
  const questsCompletedData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/quests/completed?namespace=profile-${region}`, accessToken.access_token);
  if (questsCompletedData !== undefined) {
    questsCompletedData.quests.forEach((rep) => {
      questsCompleted++;
    });
  }const pvpData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/pvp-summary?namespace=profile-${region}`, accessToken.access_token);
  if (pvpData !== undefined) {
    honorableKills = pvpData.honorable_kills;
    honorLvl = pvpData.honor_level;
  }

  const completetionScore = achievementPoints + mounts*100 + petScore + toys*25 + reputations*200 + titles*100 + questsCompleted*2 + honorableKills + honorLvl*100

  if (verifyOnly) {
    console.log(region, realm, name, completetionScore, achievementPoints, mounts, pets, petScore, toys, reputations, 0, titles, questsCompleted, honorableKills, honorLvl, new Date());
  } else {
    await libs.insert("test", "wow_leaderboard", region, realm, name, completetionScore, achievementPoints, mounts, pets, petScore, toys, reputations, 0, titles, questsCompleted, honorableKills, honorLvl, new Date());
  }
}
// console.log(await libs.select("test", "wow_leaderboard"));

libs.stopScript();
