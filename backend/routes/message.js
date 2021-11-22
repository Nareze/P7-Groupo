const express = require('express')
const router = express.Router();

const auth = require('../middlewares/auth')
const messageCtrl = require('../controllers/message')
const multer = require('../middlewares/multer-config')


router.post("/create/:id", auth, multer, messageCtrl.createMessage);
router.get("/:id", messageCtrl.getOneUserMessages);     // voir un message de l'utilisateur

router.delete("/remove/:id", auth, messageCtrl.removeMessage);
router.get("/user/:id", messageCtrl.getUserMessages);      // voir tout les messages d'un l'utlisateur

router.get("/users", auth, messageCtrl.getAllUsersMessages);  // voir tout les messages





module.exports = router;