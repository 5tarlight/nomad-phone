import { getPhoneNumbersByName } from "../twilio";

const myAccount = async (req, res) => {
  const USERNAME = "Nomad Phone";
  // TO Do: Get real user id from req.
  try {
    const {
      data: { incoming_phone_numbers }
    } = await getPhoneNumbersByName(USERNAME);
    console.log(incoming_phone_numbers);
    res.render("account", { numbers: incoming_phone_numbers });
  } catch (error) {
    console.log(error);
  }
};

export default {
  myAccount
};
