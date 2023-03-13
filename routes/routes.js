const { Router } = require("express");
const {
  loginGet,
  loginPost,
  signupGet,
  signupPost,
  logoutGet,
  resetGet,
  resetPost,
  newPasswordGet,
  newPasswordPost,
} = require("../controllers/controller.cjs");

const router = Router();

router.get("/login", loginGet);

router.post("/login", loginPost);

router.get("/signup", signupGet);

router.post("/signup", signupPost);

router.get("/logout", logoutGet);

router.get("/reset", resetGet);

router.post("/reset", resetPost);

router.get("/reset/:token", newPasswordGet);

router.post("/newPassword", newPasswordPost);

module.exports = router;
