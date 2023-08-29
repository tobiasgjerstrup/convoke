export async function checkLoggedIn(req) {
  if (req.session.user === undefined) {
    return { statuscode: 401, message: "Not Logged in" };
  }
  return { statuscode: 200 };
}

export async function validateFields(fields, design) {
  let unknownKeys = "";
  Object.keys(fields).forEach(function (key) {
    if (!design.hasOwnProperty(key)) unknownKeys += key + ", ";
  });
  if (unknownKeys !== "") return { statuscode: 400, message: "unknown key(s) in body: " + unknownKeys };
  return { statuscode: 200 };
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
