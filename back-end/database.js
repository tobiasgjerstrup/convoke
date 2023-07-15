import * as libs from "../scripts/libs.js";
import express from "express";
import session from "express-session";
import cors from "cors";
import * as sys from "./system.js";

const app = express();

// v1
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/api/v1/discordbot/playlists", async (req, res) => {
  const data = await sys.getDiscordbotPlaylists(req.query);
  console.log("discordbot playlists");
  res.send({ data: data });
});

app.get("/api/v1/items", async (req, res) => {
  const data = await sys.getItems(req.query);
  console.log("items");
  res.send({ data: data });
});

app.get("/api/v1/items/count", async (req, res) => {
  const data = await sys.getCount(req.query);
  console.log("count");
  res.send({ data });
});

app.get("/api/v1/git", async (req, res) => {
  const data = await sys.getCommits(req.query);
  console.log("git");
  res.send({ data });
});

app.get("/api/v1/minecraft/players", async (req, res) => {
  const data = await sys.getMinecraftPlayers(req.query);
  console.log("minecraft players");
  res.send({ data: data });
});

app.get("/api/v1/minecraft/chatlog", async (req, res) => {
  const data = await sys.getMinecraftChatlog(req.query);
  console.log("minecraft chatlog");
  res.send({ data: data });
});
// under here is testing stuff
app.get("/api/v1", (req, res) => {
  res.send({ user: req.session.user });
});

app.post("/api/v1/signup", express.urlencoded({ extended: true }), async (req, res) => {
  console.log("signup");
  if (!("user" in req.body) || !("pass" in req.body)) {
    res.status(200);
    res.send({ statuscode: 401, message: "missing body" });
    return;
  }
  const usernameTaken = await libs.select("production", "users", `where username = '${req.body.user}'`);
  if (usernameTaken[0] !== undefined) {
    res.status(200);
    res.send({ statuscode: 401, message: "username taken" });
    return;
  }

  const hashedPassword = await sys.hashValue(req.body.pass);

  await libs.insertv2("production", "users", {username: req.body.user, password: hashedPassword});
  res.status(200);
  res.send({ statuscode: 200, message: "😎user created" });
});

app.post("/api/v1/signin", express.urlencoded({ extended: true }), async (req, res) => {
  console.log("signin");

  req.session.regenerate(async function (err) {
    if (err) next(err);
    if (!("user" in req.body) || !("pass" in req.body)) {
      res.status(200);
      res.send({ statuscode: 401, message: "missing body" });
      return;
    }

    const user = await libs.select("production", "users", `where username = '${req.body.user}'`);

    if (user[0] === undefined) {
      res.status(200);
      res.send({ statuscode: 401, message: "user not found" });
      return;
    }

    const matchingPassword = await sys.compareHashWithValue(user[0].password, req.body.pass);

    if (!matchingPassword) {
      res.status(200);
      res.send({ statuscode: 401, message: "user not found" });
      return;
    }
    res.status(200);
    res.send({ statuscode: 200, message: "Logged in!", user: req.body.user });

    // store user information in session, typically a user id
    req.session.user = req.body.user;

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
    });
  });
});

app.post("/api/v1/logout", (req, res) => {
  if (req.session.user !== undefined) {
    delete req.session.user;
    res.send({ statuscode: 200, message: "Logged out!" });
  } else {
    res.send({ statuscode: 200, message: "Already logged out!" });
  }
});

app.post("/api/v1/discordbot/playlist/post", async (req, res) => {
  if (req.session.user === undefined) {
    res.send({ statuscode: 401, message: "Not Logged in" });
    return;
  }
  if ((await sys.getUserPermissions(req.session.user)) === false) {
    res.send({ statuscode: 401, message: "Not Authorized" });
    return;
  }

  if (!req.body.playlist || !req.body.song) {
    res.send({ statuscode: 200, message: "Missing Body" });
    return;
  }
  const response = sys.insertDiscordbotPlaylists(req.body);
  res.send({ statuscode: 200, message: response });
});

app.get("/api/v1/test", async (req, res) => {
  if ((await sys.getUserPermissions(req.session.user)) === true) {
    console.log("true");
  } else {
    console.log("false");
  }
  res.send({ statuscode: 200, message: "yes" });
});

app.listen(8080);
