import express from "express";
import phoneController from "../controllers/phoneController";

const phoneRouter = express.Router();

phoneRouter.get("/", phoneController.searchNumbers);
phoneRouter.get("/release/:phoneNumber", phoneController.releasePhoneNumber);
phoneRouter.get(
  "/rent/:countryCode/:phoneNumber",
  phoneController.rentPhoneNumber
);
phoneRouter.get("/inbox/:phoneNumber", phoneController.getPhoneNumberInbox);
phoneRouter.post("/twilio/newMessage", phoneController.handleNewMessage);

export default phoneRouter;
