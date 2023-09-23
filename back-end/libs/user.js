import { userUsers } from "../design/user.js";
import * as mysql from "./mysql.js";
import * as functions from "./functions.js";

export async function getUser(request, user) {
  const res = await mysql.SELECT("users", request.query, { nickname: true, admin: true, username: true, id: true });
  return { statuscode: 200, message: "playlist(s) found", data: res[0] };
}
export async function createUser(request, user) {
  return { statuscode: 200, message: "TOOD" };
}
export async function updateUser(request, user) {
  const body = request.body;

  const userToUpdate = await mysql.SELECT("users", { id: body.id });
  if (!userToUpdate[0][0]) return { statuscode: 400, message: "a user with that id doesn't exist" };

  const bodyWriteable = JSON.parse(JSON.stringify(body)); // objects parsed into a function will be modified by the function. No idea why
  await functions.getWritableFields(bodyWriteable, userUsers);
  const bodyWriteableUnique = JSON.parse(JSON.stringify(bodyWriteable));
  await functions.getUniqueFields(bodyWriteableUnique, userUsers);

  if (Object.keys(bodyWriteable).length === 0) {
    return { statuscode: 400, message: "body does not contain any writeable fields", schema: userUsers };
  }

  bodyWriteable.id = body.id; // add ID since it's required for checking changes & updating

  const noChanges = await mysql.SELECT("users", bodyWriteable);
  if (noChanges[0][0]) return { statuscode: 400, message: "No changes" };

  const sameBody = await mysql.SELECTAll("users", bodyWriteableUnique);
  if (Object.keys(bodyWriteableUnique).length !== 0 && ((sameBody[0][0] && sameBody[0][0]["id"] !== body.id) || sameBody[0][1])) return { statuscode: 400, message: "a field in the body is not unique" };

  bodyWriteable.lastModifiedBy = user; // add ID since it's required for checking changes & updating

  const response = await mysql.UPDATE("users", bodyWriteable);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated user successfully" };
}
export async function disableUser(request, user) {
  return { statuscode: 200, message: "TOOD" };
}
