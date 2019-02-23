import { getPhoneNumbersByName } from "../twilio";

const myAccount = async (req, res) => {
  const USERNAME = "Nomad Phone";
  try {
    const { data } = await getPhoneNumbersByName(USERNAME);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
  res.render("account");
};

export default {
  myAccount
};
