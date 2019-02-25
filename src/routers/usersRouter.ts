import express from "express";
import usersController from "../controllers/usersController";
import { onlyPrivate } from "../middlewares";

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

export default usersRouter;
