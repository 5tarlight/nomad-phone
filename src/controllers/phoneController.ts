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
import { prisma } from "../../generated/prisma-client";

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
    query: { confirmed },
    params: { countryCode, phoneNumber },
    user
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
      req.flash("error", "Something happened!");
      console.log(e);
      res.redirect("/");
    }
  } else if (Boolean(confirmed) === true) {
    if (!user) {
      req.session.continuePurchase = `/numbers/rent/${countryCode}/${phoneNumber}`;
      req.flash("info", "Create an account to continue with your purchase");
      res.redirect("/create-account");
    } else {
      try {
        const { id } = user;
        const {
          data: { sid }
        } = await buyPhoneNumber(phoneNumber, id);
        await prisma.createNumber({
          number: phoneNumber,
          twilioId: sid,
          owner: {
            connect: {
              id
            }
          }
        });
        req.flash("success", "The number has been purchased!");
        res.redirect("/dashboard");
      } catch (error) {
        console.log(error);
        req.flas(
          "error",
          "There was an error renting this phone number, choose a different one"
        );
        res.redirect(`/?country=${countryCode}`);
      }
    }
  }
};

const releasePhoneNumber = async (req, res) => {
  const {
    query: { confirmed, pid },
    params: { phoneNumber },
    user
  } = req;
  const exists = await prisma.$exists.number({
    AND: [{ owner: { id: user.id } }, { number: phoneNumber, twilioId: pid }]
  });
  if (!exists) {
    req.flash("error", "Number not found");
    return res.redirect("/dashboard");
  }
  if (confirmed && pid) {
    try {
      req.flash("success", "This number has been deleted from your account");
      await releasePhoneNumberById(pid);
      await prisma.deleteNumber({ twilioId: pid, number: phoneNumber });
    } catch (e) {
      req.flash(
        "error",
        "Could not delete this number from your account, try again later."
      );
      console.log(e);
    }
    res.redirect("/dashboard");
  } else {
    res.render("release", {
      phoneNumber,
      confirmed: false,
      pid,
      title: "Release number"
    });
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
