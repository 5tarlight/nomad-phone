import countries from "../countries";
import { Request, Response } from "express";
import { numbersByCountry, priceByCountry } from "../twilio";

const searchNumbers = async (req: Request, res: Response) => {
  const {
    query: { country }
  } = req;
  let numbers = null;
  let error = false;
  let price;
  if (country) {
    try {
      const { data: numbersData } = await numbersByCountry(country);
      numbers = numbersData.available_phone_numbers;
      const { data: priceData } = await priceByCountry(country);
      const localPrice = priceData.phone_number_prices.filter(
        number => number.number_type === "local"
      );
      if (localPrice.length !== 0) {
        price = localPrice[0].base_price;
      }
    } catch (e) {
      console.log(e);
      error = true;
    }
  }
  res.render("index", {
    countries,
    searchingBy: country,
    numbers,
    error,
    price
  });
};

export default {
  searchNumbers
};
