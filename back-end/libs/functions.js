import * as sys from "../system.js";
import * as mysql from "./mysql.js";

async function checkCookieBypass(req){
  // if user and pass is in body we let them pass without a cookie. This should only used for development reasons
  if (!("user" in req.query) || !("pass" in req.query)) {
    return false;
  }

  const username = req.query.user;
  const password = req.query.pass;
  
  delete req.query.user;
  delete req.query.pass;

  const user = await mysql.SELECT("users", {username: username});
  if (user[0][0] === undefined) {
    return false;
  }

  const matchingPassword = await sys.compareHashWithValue(user[0][0].password, password);

  if (!matchingPassword) {
    return false;
  }

  return true;
}

export async function checkLoggedIn(req) {
  if (req.session.user === undefined) {
    const cookieByPass = await checkCookieBypass(req);
    if (!cookieByPass) {
      return { statuscode: 401, message: "Not Logged in" };
    }
  }

  return { statuscode: 200 };
}

export async function validateFields(fields, design) {
  let unknownKeys = "";
  let wrongTypes = "";
  Object.keys(fields).forEach(function (key) {
    if (!design.hasOwnProperty(key)) {
      unknownKeys += key + ", ";
    } else if (typeof fields[key] !== design[key]["type"]) {
      wrongTypes += key + ", ";
    }
  });
  if (unknownKeys !== "") return { statuscode: 400, message: "unknown key(s) in body: " + unknownKeys, schema: design };
  if (wrongTypes !== "") return { statuscode: 400, message: "field(s) has wrong type(s): " + wrongTypes, schema: design };
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
