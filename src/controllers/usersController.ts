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
    res.render("dashboard", {
      numbers: incoming_phone_numbers,
      title: "Dashboard"
    });
  } catch (error) {
    console.log(error);
  }
};

const createAccount = async (req, res) => {
  const { method } = req;
  const title = "Create An Account";
  let error;
  if (method === "POST") {
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

const logIn = async (req, res) => res.render("login", { title: "Log In" });

const logOut = (req, res) => {
  req.logout();
  res.redirect("/");
};

const verifyEmail = async (req, res) => {
  const {
    method,
    query: { resend },
    user,
    body: { secret }
  } = req;
  const title = "Verify Email";
  if (method === "POST") {
    if (user.verificationSecret === secret) {
      await prisma.updateUser({
        where: { id: user.id },
        data: { verificationSecret: "", isVerified: true }
      });
      req.flash("success", "Thanks for verifying your email");
      return res.redirect("/dashboard");
    }
  } else if (resend) {
    const newSecret = genSecret();
    await prisma.updateUser({
      where: { id: user.id },
      data: { verificationSecret: newSecret }
    });
    sendVerificationEmail(user.email, newSecret);
    req.flash("info", "We just re-sent you a new secret.");
  }
  res.render("verify-email", { title });
};

export default {
  myAccount,
  createAccount,
  logIn,
  logOut,
  verifyEmail
};
