import * as sys from "../system.js";
import { createPlaylist, createSong, disablePlaylist, disableSong, getPlaylist, getPlaylistHistory, getSong, updatePlaylist, updateSong } from "./music.js";
import * as mysql from "./mysql.js";
import { musicPlaylists, musicPlaylistsHistory, musicSongs } from "../design/music.js";

export async function doRequest(functionName, request) {
  const loggedInRes = await checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  let requiredFieldsRes = { statuscode: 500 };
  let validateFieldsRes = { statuscode: 500 };
  switch (request.route.path) {
    case "/api/v1/music/playlists":
      requiredFieldsRes = await checkForRequiredfields(request, musicPlaylists);
      validateFieldsRes = await validateFields(request, musicPlaylists);
      break;
    case "/api/v1/music/playlists/history":
      requiredFieldsRes = await checkForRequiredfields(request, musicPlaylistsHistory);
      validateFieldsRes = await validateFields(request, musicPlaylistsHistory);
      break;
    case "/api/v1/music/songs":
      requiredFieldsRes = await checkForRequiredfields(request, musicSongs);
      validateFieldsRes = await validateFields(request, musicSongs);
      break;
    default:
      requiredFieldsRes.statuscode = 200;
      validateFieldsRes.statuscode = 200;
      break;
  }
  if (requiredFieldsRes.statuscode !== 200) return requiredFieldsRes;
  if (validateFieldsRes.statuscode !== 200) return validateFieldsRes;

  switch (functionName) {
    case "getPlaylist":
      return getPlaylist(request, loggedInRes.user);
    case "getPlaylistHistory":
      return getPlaylistHistory(request, loggedInRes.user);
    case "createPlaylist":
      return createPlaylist(request, loggedInRes.user);
    case "updatePlaylist":
      return updatePlaylist(request, loggedInRes.user);
    case "disablePlaylist":
      return disablePlaylist(request, loggedInRes.user);
    case "getSong":
      return getSong(request, loggedInRes.user);
    case "createSong":
      return createSong(request, loggedInRes.user);
    case "updateSong":
      return updateSong(request, loggedInRes.user);
    case "disableSong":
      return disableSong(request, loggedInRes.user);
    default:
      console.error(functionName + " does not exist");
      return { statuscode: 404, message: functionName + " does not exist" };
      break;
  }
}

async function checkForRequiredfields(request, design) {
  let response = "Required field(s) is missing in body or query: ";
  Object.keys(design).forEach(function (key) {
    if (design[key].hasOwnProperty("required") && design[key].required[request.method] === true) {
      if (!request.body.hasOwnProperty(key)) response += key + ", ";
    }
    if (design[key].hasOwnProperty("queryRequired") && design[key].queryRequired[request.method] === true) {
      if (!request.query.hasOwnProperty(key)) response += key + ", ";
    }
  });
  // bad code but return is dumb in foreach loops
  if (response !== "Required field(s) is missing in body or query: ") return { statuscode: 400, message: response.slice(0, -2) };
  return { statuscode: 200, message: "All required fields found" };
}

async function checkCookieBypass(req) {
  // if user and pass is in body we let them pass without a cookie. This should only used for development reasons
  if (!("user" in req.query) || !("pass" in req.query)) {
    return { statuscode: 400 };
  }

  const username = req.query.user;
  const password = req.query.pass;

  delete req.query.user;
  delete req.query.pass;

  const user = await mysql.SELECT("users", { username: username });
  if (user[0][0] === undefined) {
    return { statuscode: 400 };
  }

  const matchingPassword = await sys.compareHashWithValue(user[0][0].password, password);

  if (!matchingPassword) {
    return { statuscode: 400 };
  }

  return { statuscode: 200, message: "Logged in!", user: username };
}

export async function checkLoggedIn(req) {
  if (req.session.user === undefined) {
    const cookieByPass = await checkCookieBypass(req);
    if (cookieByPass.statuscode !== 200) {
      return { statuscode: 401, message: "Not Logged in" };
    } else {
      return cookieByPass;
    }
  }

  return { statuscode: 200, message: "Logged in!", user: req.session.user };
}

export async function validateFields(fields, design) {
  let unknownKeys = "";
  let wrongTypes = "";
  Object.keys(fields.body).forEach(function (key) {
    if (!design.hasOwnProperty(key)) {
      unknownKeys += key + ", ";
    } else if (typeof fields.body[key] !== design[key]["type"]) {
      wrongTypes += key + ", ";
    }
  });
  if (unknownKeys !== "") return { statuscode: 400, message: "unknown key(s) in body: " + unknownKeys.slice(0, -2), schema: design };
  if (wrongTypes !== "") return { statuscode: 400, message: "field(s) has wrong type(s): " + wrongTypes.slice(0, -2), schema: design };
  return { statuscode: 200 };
}

export async function getWritableFields(fields, design) {
  Object.keys(fields).forEach(function (key) {
    if (design[key].write === false) delete fields[key];
  });
  return fields;
}

export async function getUniqueFields(fields, design) {
  Object.keys(fields).forEach(function (key) {
    if (design[key].unique === false) delete fields[key];
  });
  return fields;
}

export async function getObjectDiffs(object1, object2, ignoreObject = {}) {
  const res = {};
  Object.keys(object1).forEach(function (key) {
    if (JSON.stringify(object1[key]) !== JSON.stringify(object2[key]) || ignoreObject.hasOwnProperty(key)) {
      res[key] = object2[key];
      // console.log(object1[key] + ' is not same as ' + object2[key])
    } else {
      // console.log(object1[key] + ' is the same as ' + object2[key])
    }
  });
  return res;
}
/* if ((await sys.getUserPermissions(req.session.user)) === false) {
  res.send({ statuscode: 401, message: "Not Authorized" });
  return;
}

if (!req.body.playlist || !req.body.song) {
  res.send({ statuscode: 200, message: "Missing Body" });
  return;
}
const response = sys.deleteDiscordbotPlaylists(req.body);
res.send({ statuscode: 200, message: response }); */
