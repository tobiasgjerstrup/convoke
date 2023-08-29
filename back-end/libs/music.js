import { musicPlaylists } from "../design/musicPlaylists.js";
import * as functions from "./functions.js";
import * as mysql from "./mysql.js";

export async function createPlaylist(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }
  const body = request.body;
  if (!body.name) return { statuscode: 400, message: "Missing field 'name' in body" };

  if (body.name.length > 255) return { statuscode: 400, message: "field 'name' exceeded the character limit of 255" };

  const playlistsWithName = await mysql.SELECT("musicPlaylists", { name: body.name });
  if (playlistsWithName[0][0]) return { statuscode: 400, message: "a playlist with that name exists already" };

  const response = await mysql.INSERT("musicPlaylists", { name: body.name, createdBy: request.session.user, lastModifiedBy: request.session.user });
  if (!response) {
    return { statuscode: 400, message: "something went wrong when creating the playlist" };
  }
  return { statuscode: 200, message: "playlist created successfully" };
}

export async function updatePlaylist(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  const body = request.body;
  if (!body.id) return { statuscode: 400, message: "Missing field 'id' in body" };

  const noChanges = await mysql.SELECT("musicPlaylists", body);
  if (noChanges[0][0]) return {statuscode: 400, message: "No changes"}

  const validation = await functions.validateFields(request.query, musicPlaylists);
  if (validation.statuscode !== 200) {
    return validation;
  }

  const playlistToUpdate = await mysql.SELECT("musicPlaylists", { id: body.id });
  if (!playlistToUpdate[0][0]) return { statuscode: 400, message: "a playlist with that id doesn't exist" };
  const id = body.id;
  delete body.id;

  if (Object.keys(body).length === 0) {
    return { statuscode: 400, message: "body is empty apart from id" };
  }

  let active = body.active;
  delete body.active;


  const sameBody = await mysql.SELECTAll("musicPlaylists", body); // TODO get a object of fields that is unique so i dont have to use this gross solution
  if (sameBody[0][0] && Object.keys(body).length !== 0) return { statuscode: 400, message: "a field in the body is not unique" };

  body.id = id;
  if (active !== undefined) {
    body.active = active;
  }

  const response = await mysql.UPDATE("musicPlaylists", body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated playlist successfully" };
}

export async function disablePlaylist(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  const body = request.body;
  if (!body.id) return { statuscode: 400, message: "Missing field 'id' in body" };

  const playlistToUpdate = await mysql.SELECT("musicPlaylists", { id: body.id, active: 1 });
  if (!playlistToUpdate[0][0]) return { statuscode: 400, message: "a playlist with that id doesn't exist or it's already disabled" };
  const id = body.id;
  delete body.id;

  if (Object.keys(body).length !== 0) {
    return { statuscode: 400, message: "body contains unknown fields", unknownFields: body };
  }

  body.id = id;
  body.active = 0;
  const response = await mysql.UPDATE("musicPlaylists", body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "disabled playlist successfully" };
}

export async function getPlaylist(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  const validation = await functions.validateFields(request.query, musicPlaylists);
  if (validation.statuscode !== 200) {
    return validation;
  }

  const playlistsWithName = await mysql.SELECT("musicPlaylists", request.query);
  if (!playlistsWithName[0][0]) return { statuscode: 400, message: "no playlist found" };

  return { statuscode: 200, message: "playlist(s) found", data: playlistsWithName[0] };
}
