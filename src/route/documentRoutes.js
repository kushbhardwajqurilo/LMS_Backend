const express = require("express");
const multer = require("multer");
const { uploadPDF, downloadPDF } = require("../controller/documentController");
 
const documentRoutes = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

documentRoutes.post("/upload", upload.single("pdf"), uploadPDF);
documentRoutes.get("/download/:id", downloadPDF);

module.exports = documentRoutes;
