const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../models");
const cryptoJS = require("crypto-js");
const emailtoCrypt = "mypassword";
const JWT_SIGN_SECRET = "mdpsecret";

exports.signup = (req, res, next) => {
  const emailCrypted = cryptoJS.SHA256(req.body.email, emailtoCrypt).toString();

  models.User.findOne({
    where: { username: req.body.username },
  }).then((usernameFound) => {
    if (usernameFound) {
      return res.status(409).json({ error: "Username already exists" }); // verification de l'username
    } else {
      models.User.findOne({
        where: { email: emailCrypted },
      }).then((emailFound) => {
        if (emailFound) {
          return res.status(409).json({ error: "Email already exists" }); // verification du mail
          } else {
          bcrypt
            .hash(req.body.password, 10)
            .then((hash) => {                 // création de l'utilisateur et envoi du token
              models.User.create({
                email: emailCrypted,
                username: req.body.username,
                password: hash,
                bio: req.body.bio,
                isAdmin: 0,
              })
            .then((user) =>{
              res.status(201).json({
                userId: user.id,
                username:user.username,
                token :jwt.sign(
                  { userId: user.id, isAdmin: user.isAdmin },
                  JWT_SIGN_SECRET,
                  {
                    expiresIn: "1h",
                  }
                  ),
                  })
            })
            })
          }
      }).catch(() => res.status(500).json());
    }
  });
};

exports.login = (req, res, next) => {
  const emailCrypted = cryptoJS.SHA256(req.body.email, emailtoCrypt).toString();

  models.User.findOne({
    where: { email: emailCrypted },
  })
  .then((user) => {
    console.log("contenu de user 1 ////////// :" + JSON.stringify(user));

    if (user) {
      bcrypt
        .compare(req.body.password, user.password)

        .then((valid) => {
          console.log("contenu valide ////////", valid)
          if (!valid) {
            res.status(401).json({ message: "Incorrect password" });
          } else {
            res.status(200).json({
              userId: user.id,
              token :jwt.sign(
                { userId: user.id, isAdmin: user.isAdmin },
                JWT_SIGN_SECRET,
                {
                  expiresIn: "1h",
                }
              ),
            });

            //   const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, "JWT_SIGN_SECRET", { expiresIn: "1h"});
            //   return res.cookie("access_token", token, {
            //       httpOnly: true,
            //       maxAge: 900000,
            //       // secure: process.env.NODE_ENV === "production",
            //     }).status(200).json({ Response : "User n°" +  user.id + " Logged in successfully" });

            
          }


        }).catch(() => res.status(500).json());
    } else {
      res.status(401).json({ message: "User not found" });
    }
  });
};

exports.profile = (req, res, next) => {
  // let headerAuth = req.headers['authorization'];
  // let userId = jwtUtils.getUserId(headerAuth);

  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, JWT_SIGN_SECRET);
  const userId = decodedToken.userId;

  // userId = req.params.id;

  models.User.findOne({
    attributes: ["id", "username", "bio", "createdAt"],
    where: { id: userId },
  }).then((user) => {
    if (!user) {
      res.status(404).json({ error: "user not found" });
    } else {
      res.status(201).json(user);
      console.log("contenu de user //////// : " + JSON.stringify(user));
    }
    
  })
  .catch(() => res.status(500).json());
};

exports.profiles = (req, res, next) => {
  models.User.findAll({
    attributes: ["username", "bio", "image", "createdAt", "id"],
  })
    .then((user) => {
      if (user != null) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "Pas de users à afficher" });
      }
    })
    .catch(() => res.status(500).json());
};

exports.deleteProfile = (req, res, next) => {

  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, JWT_SIGN_SECRET);
  const userId = decodedToken.userId;

  models.User.findOne({
    where: { id: userId }
  }).then((user) => {
    console.log("//////", user.id)
    // if (user.id || user.isAdmin == true) {
      models.User.destroy({
        where: { id: user.id}
      })
      .then(() => res.status(200).json({ message: "User deleted"}))
      .catch(() => res.status(500).json({ message: "Not allowed to delete other users"}));
    // } else {
    //   res.status(405).json({ message: "Not allowed to delete"})
    // }
  }).catch(() => res.status(500).json({ message: "Not allowed to delete"}));

};

exports.modify = (req, res, next) => {

  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, JWT_SIGN_SECRET);
  const userId = decodedToken.userId;

  const newPassword = req.body.password;
  const newUsername = req.body.username;
  const newBio = req.body.bio;

    models.User.findOne({
      where: { id: userId },
    })
    .then((user) => {

      if ((newPassword!=="") )  {
      bcrypt
        .hash(newPassword, 10)
          .then((hash) => {
            models.User.update({ password: hash }, { where: { id: user.id } })
           })
          .then(() => {
            return res.status(201).json({ message: "Changes updated" });
          });
      } if((newUsername!=="")){

        models.User.update({ username : newUsername }, { where: { id: user.id } })
        .then(() => {
          return res.status(201).json({ message: "Changes updated" });
        });

      } if((newBio!=="")) {

        models.User.update({ bio: newBio }, { where: { id: user.id } })
        .then(() => {
          return res.status(201).json({ message: "Changes updated" });
        });

      }

      }).catch(() => res.status(500).json());
};

exports.logout = (req, res, next) => {
  return res
  .clearCookie("access_token")
  .status(200)
  .json({ message: "Successfully logged out" }).catch(() => res.status(500).json());
}