import { availableCountries, getName } from "../countries";
import { Request, Response } from "express";
import { numbersByCountry, priceByCountry, buyPhoneNumber } from "../twilio";
import { extractPrice } from "../utils";

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
    price
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
      res.render(`/?country=${countryCode}`);
    }
  }
};

export default {
  searchNumbers,
  rentPhoneNumber
};
