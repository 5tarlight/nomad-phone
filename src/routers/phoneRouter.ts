import express from "express";
import phoneController from "../controllers/phoneController";
import { onlyPrivate } from "../middlewares";

const phoneRouter = express.Router();

phoneRouter.get("/", phoneController.searchNumbers);
phoneRouter.get(
  "/release/:phoneNumber",
  onlyPrivate,
  phoneController.releasePhoneNumber
);
phoneRouter.get(
  "/rent/:countryCode/:phoneNumber",
  phoneController.rentPhoneNumber
);
phoneRouter.get(
  "/inbox/:phoneNumber",
  onlyPrivate,
  phoneController.getPhoneNumberInbox
);
phoneRouter.post("/twilio/newMessage", phoneController.handleNewMessage);

export default phoneRouter;
