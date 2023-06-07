import * as libs from "./libs.js";
import { blizzardClient, verifyOnly, characters } from "./config.js";

let name = "".toLowerCase();
let realm = "".toLowerCase().split(" ").join("-").split("'").join("");
let region = "".toLowerCase();

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
  let appearances = 0;

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
  }
  const pvpData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/pvp-summary?namespace=profile-${region}`, accessToken.access_token);
  if (pvpData !== undefined) {
    honorableKills = pvpData.honorable_kills;
    honorLvl = pvpData.honor_level;
  }
  const achievementData = await libs.zeroAuthGet(`https://${region}.api.blizzard.com/profile/wow/character/${realm}/${name}/achievements?namespace=profile-${region}`, accessToken.access_token);
  if (achievementData !== undefined) {
    // console.log(achievementData.achievements)
    achievementData.achievements.forEach((achivement) => {
      switch (achivement.id) {
        case 10681: // "name": "Fashionista: Head"
        case 10682: // "name": "Fashionista: Chest"
        case 10684: // "name": "Fashionista: Legs"
        case 10685: // "name": "Fashionista: Feet"
        case 10686: // "name": "Fashionista: Waist"
        case 10687: // "name": "Fashionista: Back"
        case 10688: // "name": "Fashionista: Wrist"
        case 10690: // "name": "Fashionista: Tabard"
        case 10691: // "name": "Fashionista: Shirt"
        case 10692: // "name": "Fashionista: Shoulder"
        case 10693: // "name": "Fashionista: Hand"
          appearances += achivement.criteria.child_criteria[0].amount;
          break;
        case 10689: // "name": "Fashionista: Weapon & Off-Hand"
          appearances += achivement.criteria.amount; // this one is different... Thanks blizz API
          break;
      }
    });
    honorableKills = pvpData.honorable_kills;
    honorLvl = pvpData.honor_level;
  }

  const completetionScore = achievementPoints + mounts * 100 + petScore + toys * 25 + reputations * 200 + appearances * 2 + titles * 100 + questsCompleted * 2 + honorableKills + honorLvl * 100;

  if (verifyOnly) {
    console.log(region, realm, name, completetionScore, achievementPoints, mounts, pets, petScore, toys, reputations, appearances, titles, questsCompleted, honorableKills, honorLvl, new Date());
  } else {
    await libs.insert("production", "wow_leaderboard", region, realm, name, completetionScore, achievementPoints, mounts, pets, petScore, toys, reputations, appearances, titles, questsCompleted, honorableKills, honorLvl, new Date());
  }
}

libs.stopScript();
