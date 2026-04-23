// routes/changePasswordRoutes.js

const express = require("express");
const { changePasswordWithoutToken } = require("../controller/changePasswordController");

const changePasswordRoutes = express.Router();

// POST /api/change-password
changePasswordRoutes.post("/", changePasswordWithoutToken);

module.exports = changePasswordRoutes;
