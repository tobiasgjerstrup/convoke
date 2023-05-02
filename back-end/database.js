import { database } from "./config.js";
import * as libs from "../scripts/libs.js";
import express from "express";
import session from "express-session";
import cors from "cors";
const app = express();

// V2
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

app.get("/api/v2", (req, res) => {
  console.log(req.session);
  req.session.user = 'convoke';
  res.send({ user: req.session.user });
});

app.post("/api/v2/signup", async (req, res) => {
  console.log(req.body);
  if (!("user" in req.body) || !("pass" in req.body)) {
    res.send({ data: "missing body" });
    console.log("missing body");
    return;
  }

  const usernameTaken = await libs.select("production", "users", `where username = '${req.body.user}'`);
  if (usernameTaken[0] !== undefined) {
    res.send({ data: "username taken" });
    console.log("username taken");
    return;
  }
  await libs.insert("production", "users", req.body.user, req.body.pass);
  res.send({ data: "😎user created" });
  console.log("😎user created");
});

app.post("/api/v2/signin", express.urlencoded({ extended: true }), async (req, res) => {
  req.session.regenerate(async function (err) {
    if (err) next(err);
    console.log(req.body);
    if (!("user" in req.body) || !("pass" in req.body)) {
      res.send({ data: "missing body" });
      console.log("missing body");
      return;
    }

    const usernameTaken = await libs.select("production", "users", `where username = '${req.body.user}' and password = '${req.body.pass}'`);
    if (usernameTaken[0] === undefined) {
      res.send({ data: "user not found" });
      console.log("user not found");
      return;
    }

    console.log(req.session);
    res.send({ data: "Logged in!" });
    console.log("Logged in!");
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
// V1
/* http
  .createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    let call = req.url.replaceAll("%20", " ").split("/");
    let tmp = req.url.replaceAll("%20", " ").split(/([?&])/);
    let params = libsold.getParams(tmp);

    if (call[1] !== "api" || call[2] !== "v1") {
      return;
    }

    let sql = libsold.call(call, params);
    console.log(sql);
    result(sql).then((value) => {
      value = libsold.modifyData(value, params);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(JSON.stringify(value).replace('[{"count(*)":', '[{"count":'));
      res.end();
    });
  })
  .listen(8080); */
