import { hashPassword, genSecret, checkPassword } from "../utils";
import { prisma } from "../../generated/prisma-client";
import { sendVerificationEmail, sendPasswordResetEmail } from "../mailgun";

const dashboard = async (req, res) => {
  const { user } = req;
  try {
    const numbers = await prisma.user({ id: user.id }).numbers();
    res.render("dashboard", {
      numbers,
      title: "Dashboard"
    });
  } catch (error) {
    console.log(error);
  }
};

const createAccount = async (req, res) => {
  const { method } = req;
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
        req.flash(
          "error",
          "This user has an account already. Maybe try to log in?"
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
  res.render("create-account", { title: "Create An Account" });
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
  if (user.isVerified === true) {
    req.flash("success", "Your email is already verified!");
    res.redirect("/dashboard");
  }
  if (method === "POST") {
    if (user.verificationSecret === secret) {
      try {
        await prisma.updateUser({
          where: { id: user.id },
          data: { verificationSecret: "", isVerified: true }
        });
        req.flash("success", "Thanks for verifying your email");
        return res.redirect("/dashboard");
      } catch {
        req.flash("error", "Could not verify email");
      }
    } else {
      req.flash("error", "That secret does not match our records.");
    }
  } else if (resend) {
    const newSecret = genSecret();
    try {
      await prisma.updateUser({
        where: { id: user.id },
        data: { verificationSecret: newSecret }
      });
      sendVerificationEmail(user.email, newSecret);
      req.flash("info", "We just re-sent you a new secret.");
    } catch {
      req.flash("error", "Could not re-send email");
    }
  }
  res.render("verify-email", { title: "Verify Email" });
};

const changePassword = async (req, res) => {
  const title = "Change Password";
  const {
    body: { currentPassword, newPassword, confirmNewPassword },
    method,
    user
  } = req;
  if (method === "POST") {
    const check = await checkPassword(user.password, currentPassword);
    if (check) {
      if (newPassword === confirmNewPassword) {
        const newHash = await hashPassword(newPassword);
        try {
          await prisma.updateUser({
            where: { id: user.id },
            data: { password: newHash }
          });
          req.flash("success", "Password Updated");
          return res.redirect("/dashboard");
        } catch {
          req.flash("error", "Could not confirm password");
        }
      } else {
        res.status(400);
        req.flash("error", "The new password confirmation does not match");
      }
    } else {
      res.status(400);
      req.flash("error", "Your current password is wrong");
    }
  }
  res.render("change-password", { title });
};

const changeEmail = async (req, res) => {
  const {
    method,
    body: { email },
    user
  } = req;
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
        req.flash("info", "Email changed. You need to verify it again");
        return res.redirect("/users/verify-email");
      } catch (error) {
        req.flash("error", "Can't update email, try again later");
      }
    } else {
      req.flash("error", "This email is already in use");
    }
  }
  res.render("change-email", { title: "Change Email" });
};

const account = (req, res) => res.render("account", { title: "Account" });

const forgotPassword = async (req, res) => {
  const {
    method,
    body: { email }
  } = req;
  const MILISECONDS = 86400000;
  try {
    if (method === "POST") {
      const user = await prisma.user({ email });
      if (user) {
        const secret = genSecret();
        const miliSecondsNow = Date.now();
        const miliSecondsTomorrow = miliSecondsNow + MILISECONDS;
        const key = await prisma.createRecoveryKey({
          user: {
            connect: {
              id: user.id
            }
          },
          key: secret,
          validUntil: String(miliSecondsTomorrow)
        });
        sendPasswordResetEmail(user.id, key.id);
        req.flash("successs", "Check your email");
        res.redirect("/");
      } else {
        req.flash("error", "There is no user with this email");
      }
    }
  } catch (e) {
    req.flash("error", "Can't Change password");
  }
  res.render("forgot-password", { title: "Forgot Password" });
};

const resetPassword = async (req, res) => {
  const {
    method,
    body: { password, password2 },
    params: { id }
  } = req;
  let expired = false;
  let key, user;
  try {
    key = await prisma.recoveryKey({ id });
    user = await prisma.recoveryKey({ id }).user();
  } catch {
    req.flash("error", "Can't get verification key");
  }
  const secondsNow = Date.now();
  const isExpired = secondsNow > parseInt(key.validUntil, 10);
  if (method === "POST") {
    if (password !== password2) {
      req.flash("error", "The new password confirmation does not match");
    } else {
      if (!isExpired) {
        const newHash = await hashPassword(password);
        await prisma.updateUser({
          where: { id: user.id },
          data: { password: newHash }
        });
        await prisma.deleteRecoveryKey({ id });
        req.flash("success", "Password Changed");
        res.status(400);
        return res.redirect("/log-in");
      } else {
        expired = true;
        req.flash("error", "This link has expired");
      }
    }
  } else {
    if (key) {
      if (isExpired) {
        expired = true;
        req.flash("error", "This link has expired");
      }
    } else {
      expired = true;
      req.flash("error", "This link has expired");
    }
  }
  res.status(400);
  res.render("reset-password", { title: "Reset Password", expired });
};

const afterLogin = (req, res) => {
  const {
    session: { continuePurchase, previousPage }
  } = req;
  req.session.continuePurchase = req.session.previousPage = null;
  res.redirect(continuePurchase || previousPage || "/dashboard");
};

export default {
  afterLogin,
  dashboard,
  account,
  createAccount,
  logIn,
  logOut,
  verifyEmail,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword
};
