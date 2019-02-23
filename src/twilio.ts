import axios from "axios";
import querystring from "querystring";
import { isLocal } from "./utils";

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

export const numbersByCountry = (countryCode: string) =>
  AccountApi.get(
    `AvailablePhoneNumbers/${countryCode}/${
      isLocal(countryCode) ? "Local" : "Mobile"
    }.json?SmsEnabled=true&ExcludeAllAddressRequired=true`
  );

export const priceByCountry = (countryCode: string) =>
  PricingApi.get(`PhoneNumbers/Countries/${countryCode}`);

export const buyPhoneNumber = (number: string, username: string) => {
  return AccountApi.post(
    `IncomingPhoneNumbers.json?`,
    querystring.stringify({
      PhoneNumber: number,
      FriendlyName: username
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
};

export const getPhoneNumbersByName = (name: string) =>
  AccountApi.get("IncomingPhoneNumbers.json", {
    params: {
      FriendlyName: name
    }
  });
