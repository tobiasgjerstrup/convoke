export const musicPlaylists = {
  id: {
    type: "number",
    write: false,
    unique: true,
    required: {
      GET: false,
      POST: true,
      PUT: true,
      DELETE: true,
    },
  },
  name: {
    type: "string",
    write: true,
    unique: true,
    required: {
      GET: false,
      POST: true,
      PUT: false,
      DELETE: false,
    },
  },
  createdOn: {
    type: "date",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  lastModifiedOn: {
    type: "date",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  lastModifiedBy: {
    type: "string",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  createdBy: {
    type: "string",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  active: {
    type: "number",
    write: true,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
};

export const musicPlaylistsHistory = {
  id: {
    type: "number",
    queryRequired: { // required in query
      GET: true,
    },
  },
};

export const musicSongs = {
  id: {
    type: "number",
    write: false,
    unique: true,
    required: {
      GET: false,
      POST: true,
      PUT: true,
      DELETE: true,
    },
  },
  playlist: {
    type: "number",
    write: true,
    unique: false,
    required: {
      GET: false,
      POST: true,
      PUT: false,
      DELETE: false,
    },
  },
  name: {
    type: "string",
    write: true,
    unique: false,
    unique: false,
    required: {
      GET: false,
      POST: true,
      PUT: false,
      DELETE: false,
    },
  },
  url: {
    type: "string",
    write: true,
    unique: false,
    required: {
      GET: false,
      POST: true,
      PUT: false,
      DELETE: false,
    },
  },
  addedOn: {
    type: "date",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  lastModifiedOn: {
    type: "date",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  lastModifiedBy: {
    type: "string",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  addedBy: {
    type: "string",
    write: false,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
  active: {
    type: "number",
    write: true,
    unique: false,
    required: {
      GET: false,
      POST: false,
      PUT: false,
      DELETE: false,
    },
  },
};
