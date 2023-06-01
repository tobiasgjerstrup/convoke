import * as libs from "./libs.js";
import { blizzardClient } from "./config.js";

const name = "convoke".toLowerCase();
const realm = "Quelthalas".toLowerCase().split(" ").join("-").split("'").join("");
const region = "EU".toLowerCase();

let petScore = 0;
let pets = 0;
const accessToken =  await libs.credentialAuthPost(`https://oauth.battle.net/token`, blizzardClient.client_id, blizzardClient.client_secret);
if (accessToken === false){
    console.error('bad access token');  
    process.exit(0);
}
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
await libs.insert("test", "wow_leaderboard", region, realm, name, 0, 0, 0, pets, petScore, 0, 0, 0, 0, 0, 0, 0, new Date());
// console.log(await libs.select("test", "wow_leaderboard"));

libs.stopScript();
