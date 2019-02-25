import passport from "passport";
import { Strategy } from "passport-local";
import { prisma, User } from "../generated/prisma-client";
import { checkPassword } from "./utils";

passport.use(
  new Strategy({ usernameField: "email" }, async (username, password, done) => {
    try {
      const user = await prisma.user({ email: username });
      if (user) {
        const check = await checkPassword(user.password, password);
        if (check) {
          done(null, user);
        } else {
          done(null, false, { message: "Wrong Password" });
        }
      } else {
        done(null, false, {
          message: "This user does not exist. You need to create an account"
        });
      }
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: User, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user({ id });
    done(null, user);
  } catch (e) {
    done(e);
  }
});
