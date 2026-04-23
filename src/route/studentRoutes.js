const {
  getStudentProfile,
  getEnrolledCourses,
  getEnrolledCourseIds,
  generateCertificate,
  getStudentProfileById,
} = require("../controller/Profile/studentprofileController");
const { getStudents } = require("../controller/studentController");

const { authMiddleware } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const router = require("express").Router();

router.get("/", authMiddleware, getStudents);
router.get("/profile", authMiddleware, getStudentProfile);
router.get("/profile/:id", authMiddleware, getStudentProfileById); // 🔥 New route
router.get("/enrolled-courses", authMiddleware, getEnrolledCourses);
router.get("/enrolled-course-ids", authMiddleware, getEnrolledCourseIds);
router.get("/certificate/:courseId",authMiddleware, generateCertificate);

const studentRouter = router;
module.exports = studentRouter;
