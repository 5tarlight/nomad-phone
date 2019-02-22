import axios from "axios";

const api = axios.create({
  baseURL: `https://api.twilio.com/2010-04-01/Accounts/${
    process.env.TWILIO_SID
  }`,
  auth: {
    username: process.env.TWILIO_SID || "",
    password: process.env.TWILIO_AUTH_TOKEN || ""
  }
});

export const numbersByCountry = async (countryCode: string) =>
  api.get(`AvailablePhoneNumbers/${countryCode}/Local.json?SmsEnabled=true`);
