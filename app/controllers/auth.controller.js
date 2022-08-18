const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");
exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
            }
            res.send({ message: "User registered successfully" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
          }
          res.send({ message: "User registered successfully" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-_v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
      }
      if (!user) {
        res.status(404).send({ message: "User not found" });
        return;
      }
      let validPassword = bcrypt.compareSync(req.body.password, user.password);
      if (!validPassword) {
        res
          .status(401)
          .send({ accessToken: null, message: "Invalid password" });
      }
      let token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 3600, //one hour
      });
      let authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.authorities,
        accessToken: token,
      });
    });
};
