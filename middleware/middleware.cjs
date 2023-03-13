const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    console.log(token);
    jwt.verify(token, "demo-jwt-auth", (err, decodedToken) => {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};
module.exports = { requireAuth };
