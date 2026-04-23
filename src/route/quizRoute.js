const express = require("express");
const {
  createQuiz,
  getCurrentMonthQuizByTeacher,
  quizById,
  createQuizResult,
  userPerformance,
  allQuizStudents,
  quizResultsByStudent,
  quizResultsByCurrentStudent,
  currentUserPerformance,
  getAllQuizzes,
} = require("../controller/quizController");
const authorizeRoles = require("../middleware/roleMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const quizRoute = express.Router();

quizRoute.use(authMiddleware);

quizRoute.post("/create", authorizeRoles("teacher"), createQuiz);
quizRoute.get("/teacher/:teacherId", getCurrentMonthQuizByTeacher);
quizRoute.get("/id/:quizId", quizById);
quizRoute.post("/result", authorizeRoles("student"), createQuizResult);
quizRoute.get("/userPerformance/:id", userPerformance);
quizRoute.get(
  "/currentUserPerformance",
  authorizeRoles("student"),
  currentUserPerformance,
);
quizRoute.get("/students/:quizId", allQuizStudents);
quizRoute.get("/studentsResult/:studentId", quizResultsByStudent);
quizRoute.get(
  "/currentStudentsResult",
  authorizeRoles("student"),
  quizResultsByCurrentStudent,
);
quizRoute.get("/all", authMiddleware, authorizeRoles("student"), getAllQuizzes);

module.exports = quizRoute;
