export const userUsers = {
  username: {
    type: "string",
    queryRequired: { // required in query
      GET: false,
    },
  },
  permissions: {
    type: "string",
    queryRequired: { // required in query
      GET: false,
    },
  },
};