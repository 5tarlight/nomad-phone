import axios from "axios";

const auth = {
  username: process.env.TWILIO_SID || "",
  password: process.env.TWILIO_AUTH_TOKEN || ""
};

const AccountApi = axios.create({
  baseURL: `https://api.twilio.com/2010-04-01/Accounts/${
    process.env.TWILIO_SID
  }`,
  auth
});

const PricingApi = axios.create({
  baseURL: "https://pricing.twilio.com/v1/",
  auth
});

export const numbersByCountry = async (countryCode: string) =>
  AccountApi.get(
    `AvailablePhoneNumbers/${countryCode}/Mobile.json?SmsEnabled=true&ExcludeAllAddressRequired=true`
  );

export const priceByCountry = async (countryCode: string) =>
  PricingApi.get(`PhoneNumbers/Countries/${countryCode}`);
