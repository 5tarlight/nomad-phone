import express from "express";
import passport from "passport";
import phoneController from "../controllers/phoneController";
import usersController from "../controllers/usersController";
import { onlyPrivate, onlyPublic } from "../middlewares";

const globalRouter = express.Router();

globalRouter.get("/", phoneController.searchNumbers);
globalRouter
  .route("/create-account")
  .all(onlyPublic)
  .get(usersController.createAccount, onlyPublic)
  .post(usersController.createAccount, onlyPublic);

globalRouter
  .route("/log-in")
  .all(onlyPublic)
  .get(usersController.logIn)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/log-in",
      successFlash: "Welcome",
      failureFlash: "Can't log in. Check email and/or password"
    }),
    usersController.afterLogin
  );

globalRouter.get("/dashboard", onlyPrivate, usersController.dashboard);

globalRouter.get("/log-out", onlyPrivate, usersController.logOut);

export default globalRouter;
