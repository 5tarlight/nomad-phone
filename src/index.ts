import "./env";
import express from "express";
import logger from "morgan";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import flash from "express-flash";

const PORT = process.env.PORT || 4000;

const app = express();
app.set("views engine", "pug");
app.use(express.static(path.join(__dirname, "static")));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

const handleListening = () =>
  console.log(`✅ Listening on http://localhost:${PORT}`);

app.listen(PORT, handleListening);
