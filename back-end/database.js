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

app.get("/api/v1/items", async (req, res) => {
  const data = await sys.getItems(req.query);
  console.log('items')
  res.send({ data: data });
});

app.get("/api/v1/items/count", async (req, res) => {
  const data = await sys.getCount(req.query);
  console.log('count')
  res.send({ data });
});

app.get("/api/v1/git", async (req, res) => {
  const data = await sys.getCommits(req.query);
  console.log('git')
  res.send({ data });
});


// under here is testing stuff
app.get("/api/v1", (req, res) => {
  // req.session.user = "convoke";
  res.send({ user: req.session.user });
});

app.post("/api/v1/signup", express.urlencoded({ extended: true }), async (req, res) => {
  console.log('signup')
  if (!("user" in req.body) || !("pass" in req.body)) {
    res.send({ data: "missing body" });
    return;
  }

  const usernameTaken = await libs.select("production", "users", `where username = '${req.body.user}'`);
  if (usernameTaken[0] !== undefined) {
    res.send({ data: "username taken" });
    return;
  }
  await libs.insert("production", "users", req.body.user, req.body.pass);
  res.send({ data: "😎user created" });
});

app.post("/api/v1/signin", express.urlencoded({ extended: true }), async (req, res) => {
  console.log('signin')
  req.session.regenerate(async function (err) {
    if (err) next(err);
    if (!("user" in req.body) || !("pass" in req.body)) {
      res.send({ data: "missing body" });
      return;
    }

    const usernameTaken = await libs.select("production", "users", `where username = '${req.body.user}' and password = '${req.body.pass}'`);
    if (usernameTaken[0] === undefined) {
      res.send({ data: "user not found" });
      return;
    }

    res.send({ data: "Logged in!" });
    // store user information in session, typically a user id
    req.session.user = req.body.user;

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err);
    });
  });
});

app.listen(8080);