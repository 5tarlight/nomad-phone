import express from "express";
import phoneController from "../controllers/phoneController";
import accountController from "../controllers/accountController";

const globalRouter = express.Router();

globalRouter.get("/", phoneController.searchNumbers);
globalRouter
  .route("/create-account")
  .get(accountController.createAccount)
  .post(accountController.createAccount);

export default globalRouter;
