export const musicPlaylists = {
  id: {
    type: "number",
    write: false,
    unique: true,
  },
  name: {
    type: "string",
    write: true,
    unique: true,
  },
  createdOn: {
    type: "date",
    write: false,
    unique: false,
  },
  lastModifiedOn: {
    type: "date",
    write: false,
    unique: false,
  },
  lastModifiedBy: {
    type: "string",
    write: false,
    unique: false,
  },
  createdBy: {
    type: "string",
    write: false,
    unique: false,
  },
  active: {
    type: "number",
    write: true,
    unique: false,
  },
};

export const musicSongs = {
  id: {
    type: "number",
    write: false,
    unique: true,
  },
  playlist: {
    type: "number",
    write: true,
    unique: false,
  },
  name: {
    type: "string",
    write: true,
    unique: false,
  },
  url: {
    type: "string",
    write: true,
    unique: false,
  },
  addedOn: {
    type: "date",
    write: false,
    unique: false,
  },
  lastModifiedOn: {
    type: "date",
    write: false,
    unique: false,
  },
  lastModifiedBy: {
    type: "string",
    write: false,
    unique: false,
  },
  addedBy: {
    type: "string",
    write: false,
    unique: false,
  },
  active: {
    type: "number",
    write: true,
    unique: false,
  },
};