import express from "express";
import usersController from "../controllers/usersController";
import { onlyPrivate, onlyPublic } from "../middlewares";

const usersRouter = express.Router();

usersRouter
  .route("/verify-email")
  .all(onlyPrivate)
  .get(usersController.verifyEmail)
  .post(usersController.verifyEmail);

usersRouter
  .route("/change-password")
  .all(onlyPrivate)
  .get(usersController.changePassword)
  .post(usersController.changePassword);

usersRouter.get("/account", onlyPrivate, usersController.account);

usersRouter
  .route("/change-email")
  .all(onlyPrivate)
  .get(usersController.changeEmail)
  .post(usersController.changeEmail);

usersRouter
  .route("/forgot-password")
  .all(onlyPublic)
  .get(usersController.forgotPassword)
  .post(usersController.forgotPassword);

usersRouter
  .route("/reset-password/:id")
  .all(onlyPublic)
  .get(usersController.resetPassword)
  .post(usersController.resetPassword);

export default usersRouter;
