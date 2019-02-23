import express from "express";
import accountController from "../controllers/accountController";

const accountRouter = express.Router();

accountRouter.get("/", accountController.myAccount);

export default accountRouter;
