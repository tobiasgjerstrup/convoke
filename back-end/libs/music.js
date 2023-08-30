import { musicPlaylists } from "../design/musicPlaylists.js";
import { musicSongs } from "../design/musicSongs.js";
import * as functions from "./functions.js";
import * as mysql from "./mysql.js";

//#region Playlists
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

  const validation = await functions.validateFields(body, musicPlaylists);
  if (validation.statuscode !== 200) {
    return validation;
  }

  const playlistToUpdate = await mysql.SELECT("musicPlaylists", { id: body.id });
  if (!playlistToUpdate[0][0]) return { statuscode: 400, message: "a playlist with that id doesn't exist" };

  const bodyWriteable = JSON.parse(JSON.stringify(body)); // objects parsed into a function will be modified by the function. No idea why
  await functions.getWritableFields(bodyWriteable, musicPlaylists);
  const bodyWriteableUnique = JSON.parse(JSON.stringify(bodyWriteable));
  await functions.getUniqueFields(bodyWriteableUnique, musicPlaylists);

  if (Object.keys(bodyWriteable).length === 0) {
    return { statuscode: 400, message: "body does not contain any writeable fields", schema: musicPlaylists };
  }

  bodyWriteable.id = body.id; // add ID since it's required for checking changes & updating

  const noChanges = await mysql.SELECT("musicPlaylists", bodyWriteable);
  if (noChanges[0][0]) return { statuscode: 400, message: "No changes" };

  const sameBody = await mysql.SELECTAll("musicPlaylists", bodyWriteableUnique);
  if (Object.keys(bodyWriteableUnique).length !== 0 && ((sameBody[0][0] && sameBody[0][0]["id"] !== body.id) || sameBody[0][1])) return { statuscode: 400, message: "a field in the body is not unique" };

  const response = await mysql.UPDATE("musicPlaylists", bodyWriteable);
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

  const playlistsWithName = await mysql.SELECT("musicPlaylists", request.query);
  if (!playlistsWithName[0][0]) return { statuscode: 400, message: "no playlist found" };

  return { statuscode: 200, message: "playlist(s) found", data: playlistsWithName[0] };
}
//#endregion
//#region Songs
export async function createSong(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }
  const body = request.body;
  if (!body.name) return { statuscode: 400, message: "Missing field 'name' in body" };
  if (!body.playlist) return { statuscode: 400, message: "Missing field 'playlist' in body" };
  if (!body.url) return { statuscode: 400, message: "Missing field 'url' in body" };

  const validation = await functions.validateFields(request.body, musicSongs);
  if (validation.statuscode !== 200) {
    return validation;
  }

  if (body.name.length > 255) return { statuscode: 400, message: "field 'name' exceeded the character limit of 255" };

  const response = await mysql.INSERT("musicSongs", { url: body.url, playlist: body.playlist, name: body.name, addedBy: request.session.user, lastModifiedBy: request.session.user });
  if (!response) {
    return { statuscode: 400, message: "something went wrong when creating the song" };
  }
  return { statuscode: 200, message: "song created successfully" };
}

export async function updateSong(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }
  const body = request.body;
  if (!body.id) return { statuscode: 400, message: "Missing field 'id' in body" };

  const validation = await functions.validateFields(body, musicSongs);
  if (validation.statuscode !== 200) {
    return validation;
  }

  const songToUpdate = await mysql.SELECT("musicSongs", { id: body.id });
  if (!songToUpdate[0][0]) return { statuscode: 400, message: "a song with that id doesn't exist" };

  const bodyWriteable = JSON.parse(JSON.stringify(body)); // objects parsed into a function will be modified by the function. No idea why
  await functions.getWritableFields(bodyWriteable, musicSongs);
  const bodyWriteableUnique = JSON.parse(JSON.stringify(bodyWriteable));
  await functions.getUniqueFields(bodyWriteableUnique, musicSongs);

  if (Object.keys(bodyWriteable).length === 0) {
    return { statuscode: 400, message: "body does not contain any writeable fields", schema: musicSongs };
  }

  bodyWriteable.id = body.id; // add ID since it's required for checking changes & updating

  const noChanges = await mysql.SELECT("musicSongs", bodyWriteable);
  if (noChanges[0][0]) return { statuscode: 400, message: "No changes" };

  const sameBody = await mysql.SELECTAll("musicSongs", bodyWriteableUnique);
  if (Object.keys(bodyWriteableUnique).length !== 0 && ((sameBody[0][0] && sameBody[0][0]["id"] !== body.id) || sameBody[0][1])) return { statuscode: 400, message: "a field in the body is not unique" };

  const response = await mysql.UPDATE("musicSongs", bodyWriteable);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated song successfully" };
}

export async function disableSong(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  const body = request.body;
  if (!body.id) return { statuscode: 400, message: "Missing field 'id' in body" };

  const songToUpdate = await mysql.SELECT("musicSongs", { id: body.id, active: 1 });
  if (!songToUpdate[0][0]) return { statuscode: 400, message: "a song with that id doesn't exist or it's already disabled" };
  const id = body.id;
  delete body.id;

  if (Object.keys(body).length !== 0) {
    return { statuscode: 400, message: "body contains unknown fields", unknownFields: body };
  }

  body.id = id;
  body.active = 0;
  const response = await mysql.UPDATE("musicSongs", body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "disabled song successfully" };
}

export async function getSong(request) {
  const loggedInRes = await functions.checkLoggedIn(request);
  if (loggedInRes.statuscode !== 200) {
    return loggedInRes;
  }

  const songsWithName = await mysql.SELECT("musicSongs", request.query);
  if (!songsWithName[0][0]) return { statuscode: 400, message: "no song found" };

  return { statuscode: 200, message: "song(s) found", data: songsWithName[0] };
}

//#endregion
