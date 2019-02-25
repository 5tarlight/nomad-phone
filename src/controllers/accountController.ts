import { getPhoneNumbersByName } from "../twilio";
import { hashPassword, genSecret } from "../utils";
import { prisma } from "../../generated/prisma-client";
import { sendVerificationEmail } from "../mailgun";

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

const createAccount = async (req, res) => {
  const title = "Create An Account";
  let error;
  if (req.method === "POST") {
    const {
      body: { email, password }
    } = req;
    // Check that email does not exist. Else, send errors
    try {
      const exists = await prisma.$exists.user({ email });
      if (!exists) {
        const hash = await hashPassword(password);
        await prisma.createUser({ email, password: hash });
        const secret = genSecret();
        sendVerificationEmail(email, secret);
      } else {
        error = "This user has an account already. Maybe try to log in?";
      }
    } catch (e) {
      error = e;
    }
  }
  res.render("create-account", { title, error });
};

export default {
  myAccount,
  createAccount
};
