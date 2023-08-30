export async function checkLoggedIn(req) {
  if (req.session.user === undefined) {
    return { statuscode: 401, message: "Not Logged in" };
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
