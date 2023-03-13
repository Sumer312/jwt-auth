const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/routes");
const cookieParser = require("cookie-parser");
const { requireAuth } = require("./middleware/middleware.cjs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const token = req.cookies.jwt;
  res.render("home", { isLoggedIn: token });
});
app.get("/smoothies", requireAuth, (req, res) => {
  const token = req.cookies.jwt;
  res.render("smoothies", { isLoggedIn: token });
});
app.use(authRoutes);

const dbURI = "mongodb://mongo:27017/docker-node-mongo-jwt";
mongoose
  .connect(dbURI)
  .then((result) => app.listen(3000, () => console.log("Server on 3000")))
  .catch((err) => console.log(err));
