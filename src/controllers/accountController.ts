import { getPhoneNumbersByName } from "../twilio";
import { hashPassword, genSecret, checkPassword } from "../utils";
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
        const secret = genSecret();
        await prisma.createUser({
          email,
          password: hash,
          verificationSecret: secret
        });
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

const logIn = async (req, res) => {
  const title = "Log In";
  let error;
  if (req.method === "POST") {
    const {
      body: { email, password }
    } = req;
    const user = await prisma.user({ email });
    if (user) {
      const check = await checkPassword(user.password, password);
      if (check) {
        // To Do (Log user In)
      } else {
        error = "Wrong Password";
      }
    } else {
      error = "This user does not exist. You need to create an account?";
    }
  }
  res.render("login", { title, error });
};

export default {
  myAccount,
  createAccount,
  logIn
};
