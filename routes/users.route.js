const express = require("express");
const router = express.Router();

const httpStatusText = require("../utils/httpStatusText");

const multer = require("multer");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb => callback
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType == "image") {
    return cb(null, true);
  } else {
    return cb(
      appError.create("this is not an image", 400, httpStatusText.ERROR),
      false
    );
  }
};

const upload = multer({ storage: diskStorage, fileFilter });

const userController = require("../controllers/users.controller");
const verifyToken = require("../middleware/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middleware/allowedTo");
const appError = require("../utils/appError");
// get all users
// register
// login
router.route("/").get(verifyToken, userController.getAllUsers);

router
  .route("/:userId")
  .get(userController.getSingleUser)
  .delete(verifyToken, allowedTo(userRoles.MANAGER), userController.deleteUser);

router
  .route("/register")
  .post(upload.single("avatar"), userController.register);

router.route("/login").post(userController.login);

module.exports = router;
