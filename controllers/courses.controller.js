const { validationResult } = require("express-validator");

const Course = require("../models/course.model");

const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const appError = require("../utils/appError");

const getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { '__v': 0 }).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
});

const getSingleCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      const error = appError.create("not found course", 404, httpStatusText.FAIL);
      return next(error);
      // return res.status(404).json({status: httpStatusText.FAIL, data: { course: "course not found" } });
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { course } });
});

const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
    // return res.status(400).json({ status: httpStatusText.FAIL, data: errors.array() });
  }
  const newCourse = new Course(req.body);
  const course = await newCourse.save();
  return res.status(201).json({ status: httpStatusText.SUCCESS, data: { course } });
});

const updateCourse = asyncWrapper(async (req, res) => {
  const courseUpdate = await Course.updateOne({ _id: req.params.courseId }, { $set: { ...req.body } });
  return res.status(200).json({ status: httpStatusText.SUCCESS, data: { course: courseUpdate } });
});

const deleteCourse = asyncWrapper(async (req, res) => {
  await Course.deleteOne({ _id: req.params.courseId });
  return res.json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
  getAllCourses,
  getSingleCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
