export const localsMiddleware = (req, res, next) => {
  res.locals.currentUser = req.user;
  next();
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect("/");
  }
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};
