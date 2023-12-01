const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courses.controller");
const { body } = require("express-validator");
const { validationSchema } = require("../middleware/validationSchema");
const verifyToken = require("../middleware/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middleware/allowedTo");

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(verifyToken, allowedTo(userRoles.MANAGER) ,validationSchema(), courseController.addCourse);

router
  .route("/:courseId")
  .get(courseController.getSingleCourse)
  .patch(courseController.updateCourse)
  .delete( verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), courseController.deleteCourse);

module.exports = router;
 