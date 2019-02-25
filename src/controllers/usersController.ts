import { getPhoneNumbersByName } from "../twilio";
import { hashPassword, genSecret, checkPassword } from "../utils";
import { prisma } from "../../generated/prisma-client";
import { sendVerificationEmail } from "../mailgun";

const dashboard = async (req, res) => {
  const { user } = req;
  try {
    const {
      data: { incoming_phone_numbers }
    } = await getPhoneNumbersByName(user.id);
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
        req.flash("success", "Account created! Log in now");
        return res.redirect("/log-in");
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

const changePassword = async (req, res) => {
  const title = "Change Password";
  const {
    body: { currentPassword, newPassword, confirmNewPassword },
    method,
    user
  } = req;
  let error;
  if (method === "POST") {
    const check = await checkPassword(user.password, currentPassword);
    if (check) {
      if (newPassword === confirmNewPassword) {
        const newHash = await hashPassword(newPassword);
        await prisma.updateUser({
          where: { id: user.id },
          data: { password: newHash }
        });
        req.flash("success", "Password Updated");
        return res.redirect("/dashboard");
      } else {
        res.status(400);
        error = "The new password confirmation does not match";
      }
    } else {
      res.status(400);
      error = "Your current password is wrong";
    }
  }
  res.render("change-password", { title, error });
};

const changeEmail = async (req, res) => {
  const {
    method,
    body: { email },
    user
  } = req;
  let error;
  if (method === "POST") {
    const isUsed = await prisma.$exists.user({
      email
    });
    if (!isUsed) {
      const newSecret = genSecret();
      try {
        await prisma.updateUser({
          where: { id: user.id },
          data: { verificationSecret: newSecret, isVerified: false, email }
        });
        sendVerificationEmail(user.email, newSecret);
        req.flash("warning", "Email changed. You need to verify it again");
        return res.redirect("/users/verify-email");
      } catch (error) {
        error = "Can't update email, try again later";
      }
    } else {
      error = "This email is already in use";
    }
  }
  res.render("change-email", { title: "Change Email", error });
};

const account = (req, res) => {
  res.render("account", { title: "Account" });
};

export default {
  dashboard,
  account,
  createAccount,
  logIn,
  logOut,
  verifyEmail,
  changePassword,
  changeEmail
};
