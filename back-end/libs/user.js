import * as mysql from "./mysql.js";

export async function getUser(request, loggedInRes) {
  const res = await mysql.SELECT("users", request.query, {username: true, permissions: true});
  return { statuscode: 200, message: res[0] };
}
export async function createUser(request, loggedInRes) {
  return { statuscode: 200, message: "TOOD" };
}
export async function updateUser(request, loggedInRes) {
  return { statuscode: 200, message: "TOOD" };
}
export async function disableUser(request, loggedInRes) {
  return { statuscode: 200, message: "TOOD" };
}
