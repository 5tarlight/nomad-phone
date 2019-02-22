import countries from "../countries";
import { Request, Response } from "express";
import { numbersByCountry } from "../twilio";

const searchNumbers = async (req: Request, res: Response) => {
  const {
    query: { country }
  } = req;
  let numbers = null;
  let error = false;
  if (country) {
    try {
      const { data } = await numbersByCountry(country);
      numbers = data.available_phone_numbers;
      console.log(numbers);
    } catch (error) {
      error = true;
      console.log(error);
    }
  }
  res.render("index", { countries, searchingBy: country, numbers, error });
};

export default {
  searchNumbers
};
