const express = require("express");
const { getTeacherProfileById, getAllTeacherProfiles } = require("../controller/teacherProfileController");
const teacherProfileRoutes = express.Router();
 
// GET all teacher profiles
teacherProfileRoutes.get("/",  getAllTeacherProfiles);

// GET single teacher profile by ID
teacherProfileRoutes.get("/:id",  getTeacherProfileById);
 
module.exports = teacherProfileRoutes;
