import express from "express";
import passport from "passport";
import phoneController from "../controllers/phoneController";
import usersController from "../controllers/usersController";

const globalRouter = express.Router();

globalRouter.get("/", phoneController.searchNumbers);
globalRouter
  .route("/create-account")
  .get(usersController.createAccount)
  .post(usersController.createAccount);

globalRouter
  .route("/log-in")
  .get(usersController.logIn)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/log-in",
      successRedirect: "/accounts/",
      successFlash: "Welcome",
      failureFlash: "Can't log in. Check email and/or password"
    })
  );

globalRouter.get("/dashboard", usersController.myAccount);

export default globalRouter;
