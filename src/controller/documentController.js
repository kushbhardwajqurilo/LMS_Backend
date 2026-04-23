 const DocumentModel = require("../model/DocumentModel");
const { uploadMediaToCloudinary } = require("../upload/cloudinary");

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { title } = req.body;

    // Convert PDF buffer to base64 for Cloudinary
    const fileStr = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;

    const uploadResult = await uploadMediaToCloudinary.uploader.upload(fileStr, {
      resource_type: "raw",
      folder: "pdfs",
    });

    const newDoc = new DocumentModel({
      title,
      fileUrl: uploadResult.secure_url,
    });

    await newDoc.save();

    res.status(201).json({ message: "PDF uploaded successfully", data: newDoc });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Redirect to the Cloudinary-hosted PDF
    res.redirect(doc.fileUrl);
  } catch (error) {
    console.error("Download Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
