require("dotenv").config();
const express = require("express"); // elegant mongodb object modeling for node.js
const path = require("path");
const cors = require("cors");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const httpStatusText = require("./utils/httpStatusText");

const mongoose = require("mongoose");

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("mongodb server started");
});

app.use(cors());
app.use(express.json());

const courseRouter = require("./routes/courses.route");
const userRouter = require("./routes/users.route");

app.use("/api/courses", courseRouter);
app.use("/api/users", userRouter);

// global middleware for not found routes
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    data: { message: "page not found" },
  });
});

// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 5000, (req, res) => {
  console.log("listening on port 5000");
});
