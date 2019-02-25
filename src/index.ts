import "./env";
import express from "express";
import logger from "morgan";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import flash from "express-flash";
import session from "express-session";
import passport from "passport";
import phoneRouter from "./routers/phoneRouter";
import usersRouter from "./routers/usersRouter";
import globalRouter from "./routers/globalRouter";
import { localsMiddleware } from "./middlewares";
import "./passport";

const PORT = process.env.PORT || 4000;

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "static")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(localsMiddleware);

app.use("/", globalRouter);
app.use("/numbers", phoneRouter);
app.use("/users", usersRouter);

const handleListening = () =>
  console.log(`✅ Listening on http://localhost:${PORT}`);

app.listen(PORT, handleListening);
