const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const users = await User.find({}, { __v: 0, password: 0, token: 0 })
    .limit(limit)
    .skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const getSingleUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.userId, { __v: 0, password: 0 });
  if (!user) {
    const error = appError.create("not found user", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { user } });
});

const deleteUser = asyncWrapper(async (req, res) => {
  await User.deleteOne({ _id: req.params.userId });
  return res.json({ status: httpStatusText.SUCCESS, data: null });
});

const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const error = appError.create(
      "user already exists",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }

  // password hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    avatar: req.file.filename,
  });
  // generate JWT token
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;

  const user = await newUser.save();
  res.status(201).json({ status: httpStatusText.SUCCESS, data: { user } });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const error = appError.create(
      "provide email and password",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(error);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);

  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });
    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { token } });
  } else {
    const error = appError.create(
      "invalid email or password",
      400,
      httpStatusText.FAIL
    );
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  getSingleUser,
  deleteUser,
  register,
  login,
};
