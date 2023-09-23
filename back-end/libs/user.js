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
  const response = await mysql.UPDATE("users", request.body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated user successfully" };
}
export async function disableUser(request, user) {
  return { statuscode: 200, message: "TOOD" };
}
