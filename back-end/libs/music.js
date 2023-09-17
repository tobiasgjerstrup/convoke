import { musicPlaylists, musicSongs } from "../design/music.js";
import * as functions from "./functions.js";
import * as mysql from "./mysql.js";

//#region Playlists
export async function createPlaylist(request, user) {
  const body = request.body;

  const playlistsWithName = await mysql.SELECT("musicPlaylists", { name: body.name });
  if (playlistsWithName[0][0]) return { statuscode: 400, message: "a playlist with that name exists already" };

  const response = await mysql.INSERT("musicPlaylists", { name: body.name, createdBy: user, lastModifiedBy: user });
  if (!response) {
    return { statuscode: 400, message: "something went wrong when creating the playlist" };
  }
  return { statuscode: 200, message: "playlist created successfully" };
}

export async function updatePlaylist(request, user) {
  const body = request.body;

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

  bodyWriteable.lastModifiedBy = user; // add ID since it's required for checking changes & updating

  const response = await mysql.UPDATE("musicPlaylists", bodyWriteable);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated playlist successfully" };
}

export async function disablePlaylist(request, user) {
  const body = request.body;

  const playlistToUpdate = await mysql.SELECT("musicPlaylists", { id: body.id, active: 1 });
  if (!playlistToUpdate[0][0]) return { statuscode: 400, message: "a playlist with that id doesn't exist or it's already disabled" };

  body.active = 0;
  body.lastModifiedBy = user;

  const response = await mysql.UPDATE("musicPlaylists", body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "disabled playlist successfully" };
}

export async function getPlaylist(request, user) {
  const playlistsWithName = await mysql.SELECT("musicPlaylists", request.query);
  if (!playlistsWithName[0][0]) return { statuscode: 400, message: "no playlist found" };

  return { statuscode: 200, message: "playlist(s) found", data: playlistsWithName[0] };
}

export async function getPlaylistHistory(request, user) {
  const playlistsWithName = await mysql.SELECT("musicPlaylistsHistory", request.query);
  if (!playlistsWithName[0][0]) return { statuscode: 400, message: "no playlist found" };

  const responseObject = [playlistsWithName[0][0]];
  responseObject[0].dataType = "playlist";

  for (let i = 1; i < playlistsWithName[0].length; i++) {
    responseObject[i] = await functions.getObjectDiffs(playlistsWithName[0][i - 1], playlistsWithName[0][i], { lastModifiedOn: true, lastModifiedBy: true, id: true });
    responseObject[i].dataType = "playlist";
  }

  const songsHistory = await mysql.SELECT("musicSongsHistory", { playlist: request.query.id });
  responseObject[responseObject.length] = songsHistory[0][0];
  responseObject[responseObject.length - 1].dataType = "song ";
  for (let i = 1; i < songsHistory[0].length; i++) {
    responseObject[responseObject.length] = await functions.getObjectDiffs(songsHistory[0][i - 1], songsHistory[0][i], { lastModifiedOn: true, lastModifiedBy: true, id: true });
    responseObject[responseObject.length - 1].dataType = "song";
  }

  for (let i = 0; i < responseObject.length; i++) {
    if (responseObject[i].hasOwnProperty("lastModifiedOn")) {
      responseObject[i].dateModified = responseObject[i].lastModifiedOn
        .toISOString()
        .replace(/T/, " ") // replace T with a space
        .replace(/\..+/, ""); // delete the dot and everything after;
      delete responseObject[i].lastModifiedOn;
    }
  }
  return {
    statuscode: 200,
    message: "playlist(s) found",
    data: responseObject.sort((a, b) => {
      return new Date(b.dateModified) - new Date(a.dateModified);
    }),
  };
}
//#endregion
//#region Songs
export async function createSong(request, user) {
  const body = request.body;

  if (body.name.length > 255) return { statuscode: 400, message: "field 'name' exceeded the character limit of 255" };

  const response = await mysql.INSERT("musicSongs", { url: body.url, playlist: body.playlist, name: body.name, addedBy: user, lastModifiedBy: user });
  if (!response) {
    return { statuscode: 400, message: "something went wrong when creating the song" };
  }
  return { statuscode: 200, message: "song created successfully" };
}

export async function updateSong(request, user) {
  const body = request.body;

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

  bodyWriteable.lastModifiedBy = user; // add ID since it's required for checking changes & updating

  const response = await mysql.UPDATE("musicSongs", bodyWriteable);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "updated song successfully" };
}

export async function disableSong(request, user) {
  const body = request.body;

  const songToUpdate = await mysql.SELECT("musicSongs", { id: body.id, active: 1 });
  if (!songToUpdate[0][0]) return { statuscode: 400, message: "a song with that id doesn't exist or it's already disabled" };

  body.active = 0;
  body.lastModifiedBy = user;

  const response = await mysql.UPDATE("musicSongs", body);
  if (response.statuscode !== 200) {
    return response;
  }

  return { statuscode: 200, message: "disabled song successfully" };
}

export async function getSong(request, user) {
  const songsWithName = await mysql.SELECT("musicSongs", request.query);
  if (!songsWithName[0][0]) return { statuscode: 400, message: "no song found" };

  return { statuscode: 200, message: "song(s) found", data: songsWithName[0] };
}

//#endregion
