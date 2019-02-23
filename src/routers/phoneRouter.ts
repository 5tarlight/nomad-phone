import express from "express";
import phoneController from "../controllers/phoneController";

const phoneRouter = express.Router();

phoneRouter.get("/", phoneController.searchNumbers);
phoneRouter.get(
  "/rent/:countryCode/:phoneNumber",
  phoneController.rentPhoneNumber
);

export default phoneRouter;
