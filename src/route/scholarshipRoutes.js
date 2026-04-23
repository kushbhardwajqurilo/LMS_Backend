const express = require("express");
const scholarshipRoutes = express.Router();
const {authMiddleware} = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const scholarshipController = require("../controller/scholarshipController");
 
// Student applies
scholarshipRoutes.post("/apply", authMiddleware, authorizeRoles("student"),  scholarshipController.applyScholarship);

// Student: Get their own scholarships
scholarshipRoutes.get("/my", authMiddleware, authorizeRoles("student"), scholarshipController.getMyScholarships);

// Admin list all
scholarshipRoutes.get("/", authMiddleware, authorizeRoles("admin"), scholarshipController.getAllScholarships);

// Admin approve/reject
scholarshipRoutes.patch("/:id/status", authMiddleware, authorizeRoles("admin"), scholarshipController.updateScholarshipStatus);

// Admin credit
scholarshipRoutes.post("/:id/credit", authMiddleware, authorizeRoles("admin"), scholarshipController.creditScholarship);

// Admin see student's courses
scholarshipRoutes.get("/student/:studentId/courses", authMiddleware, authorizeRoles("admin"), scholarshipController.getStudentCourses);

// Admin grants scholarship directly to student on course
scholarshipRoutes.post("/admin/grant", authMiddleware, authorizeRoles("admin"), scholarshipController.adminGrantScholarship);

module.exports = scholarshipRoutes;
