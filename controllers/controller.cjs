require("dotenv").config();
const User = require("../models/User.cjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
   host: 'smtp.gmail.com',
   port: 465,
   secure: true,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD
  },
});

const loginGet = (req, res) => {
  const token = req.cookies.jwt;
  res.render("login", { isLoggedIn: token });
};
const signupGet = (req, res) => {
  const token = req.cookies.jwt;
  res.render("signup", { isLoggedIn: token });
};
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) =>
  jwt.sign({ id }, "demo-jwt-auth", { expiresIn: maxAge });

const loginPost = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
};

const signupPost = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    console.log(err);
    res.status(404).json(err);
  }
};

const logoutGet = (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
};

const resetGet = (req, res) => {
  const LoggedInToken = req.cookies.jwt;
  res.render("reset", { isLoggedIn: LoggedInToken });
};

const resetPost = (req, res) => {
  const { email } = req.body;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.redirect("/reset");
        } else {
          user.resetToken = token;
          user.resetTokenExpirationDate = Date.now() + 360000;
          return user.save();
        }
      })
      .then((result) => {
        return transporter.sendMail({
          to: email,
          from: process.env.USERNAME,
          subject: "Password reset",
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
        });
        // res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const newPasswordGet = (req, res) => {
  const LoggedInToken = req.cookies.jwt;
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpirationDate: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.redirect("/reset");
    }
    res.render("new-password", {
      isLoggedIn: LoggedInToken,
      userId: user._id.toString(),
      passwordToken: token,
    });
  });
};

const newPasswordPost = (req, res) => {
  const { newPassword, userId, passwordToken } = req.body;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetTokenExpirationDate = undefined;
      return user.save();
    })
    .then(() => res.redirect("/login"))
    .catch((err) => console.log(err));
};
module.exports = {
  loginGet,
  loginPost,
  signupGet,
  signupPost,
  logoutGet,
  resetGet,
  resetPost,
  newPasswordGet,
  newPasswordPost,
};
