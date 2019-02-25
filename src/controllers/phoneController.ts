import { availableCountries, getName } from "../countries";
import { Request, Response } from "express";
import {
  numbersByCountry,
  priceByCountry,
  buyPhoneNumber,
  releasePhoneNumberById,
  getInbox
} from "../twilio";
import { extractPrice } from "../utils";
import { sendNewSMSMail } from "../mailgun";

const searchNumbers = async (req: Request, res: Response) => {
  const {
    query: { country }
  } = req;
  let numbers = null;
  let error = false;
  let price;
  if (country) {
    try {
      const {
        data: { available_phone_numbers }
      } = await numbersByCountry(country);
      numbers = available_phone_numbers;
      const {
        data: { phone_number_prices }
      } = await priceByCountry(country);
      price = extractPrice(phone_number_prices, country);
    } catch (e) {
      console.log(e);
      error = true;
    }
  }
  res.render("index", {
    availableCountries,
    searchingBy: country,
    numbers,
    error,
    price,
    title: "Get SMS from anywhere in the world"
  });
};

const rentPhoneNumber = async (req, res) => {
  const {
    query: { confirmed }
  } = req;
  const {
    params: { countryCode, phoneNumber }
  } = req;

  if (!confirmed) {
    try {
      const {
        data: { phone_number_prices }
      } = await priceByCountry(countryCode);
      res.render("purchase", {
        confirmed,
        country: getName(countryCode),
        phoneNumber,
        price: extractPrice(phone_number_prices, countryCode)
      });
    } catch (e) {
      // To Do: Make Flash
      console.log(e);
      res.redirect("/");
    }
  } else if (Boolean(confirmed) === true) {
    console.log(phoneNumber);
    try {
      // To Do: Get the real username!
      await buyPhoneNumber(phoneNumber, "Nomad Phone");
      // To Do: Make flash message saying success
      res.redirect("/account");
    } catch (error) {
      console.log(error);
      // To Do: Make flash message saying error
      res.redirect(`/?country=${countryCode}`);
    }
  }
};

const releasePhoneNumber = async (req, res) => {
  const {
    query: { confirmed, pid }
  } = req;
  const {
    params: { phoneNumber }
  } = req;
  if (confirmed && pid) {
    try {
      // TO Do: Flash Message with deletion success
      await releasePhoneNumberById(pid);
    } catch (e) {
      // To Do: Flash message with error
      console.log(e);
    }
    res.redirect("/account");
  } else {
    res.render("release", { phoneNumber, confirmed: false, pid });
  }
};

const getPhoneNumberInbox = async (req, res) => {
  const {
    params: { phoneNumber }
  } = req;
  let error;
  let messages;
  try {
    // TO DO : Check that the user OWNS the phone number
    const {
      data: { messages: receivedMessages }
    } = await getInbox(phoneNumber);
    messages = receivedMessages;
  } catch (e) {
    console.log(e);
    error = "Cant' check Inbox at this time";
  }
  res.render("inbox", { phoneNumber, error, messages });
};

const handleNewMessage = (req, res) => {
  const {
    body: { From, Body, To }
  } = req;
  console.log(From, Body, To);
  res.end().status(200);
  try {
    // TO DO: Find the user that owns this number
    sendNewSMSMail(From, Body, To);
  } catch (e) {
    console.log(e);
  }
};

export default {
  searchNumbers,
  rentPhoneNumber,
  releasePhoneNumber,
  getPhoneNumberInbox,
  handleNewMessage
};
