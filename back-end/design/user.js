export const userUsers = {
  nickname: {
    type: "string",
    queryRequired: {
      // required in query
      GET: false,
    },
  },
  admin: {
    type: "number",
    queryRequired: {
      // required in query
      GET: false,
    },
  },
  username: {
    type: "string",
    write: false,
    unique: true,
    queryRequired: {
      // required in query
      GET: false,
    },
  },
  id: {
    type: "number",
    write: false,
    unique: true,
    required: {
      GET: false,
      POST: false,
      PUT: true,
      DELETE: true,
    },
  },
};
