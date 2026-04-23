const {
  saveLectureProgress,
  getCourseProgress,
} = require("../controller/courseController");
const { authMiddleware } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const lectureRouter = require("express").Router();

lectureRouter.post(
  "/",
  authMiddleware,
  authorizeRoles("student"),
  saveLectureProgress,
);
lectureRouter.get(
  "/:courseId",
  authMiddleware,
  authorizeRoles("student"),
  getCourseProgress,
);

module.exports = lectureRouter;
