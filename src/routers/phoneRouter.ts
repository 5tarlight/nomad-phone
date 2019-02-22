import express from "express";
import phoneController from "../controllers/phoneController";

const phoneRouter = express.Router();

phoneRouter.get("/", phoneController.searchNumbers);

export default phoneRouter;
