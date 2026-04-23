const StudentProfileModel = require("../../model/studentProfileModel.js");
const CourseModel = require("../../model/CourseModel");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const util = require("util");
const ScholarshipModel = require("../../model/Scholarship.js");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Console all current config values
// console.log("Cloudinary Config:");
// console.log("Cloud Name:", cloudinary.config().cloud_name);
// console.log("API Key:", cloudinary.config().api_key);
// console.log("API Secret:", cloudinary.config().api_secret);

const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const studentProfile = await StudentProfileModel.findOne({ userId })
      .populate("userId", "name email") // Populate basic user info
      .populate({
        path: "enrolledCourses.courseId",
        select:
          "courseTitle courseDescription coursePrice courseInstructor courseCategory",
        populate: {
          path: "courseInstructor",
          select: "name email",
        },
      });
    // .populate({
    //   path: "tutionBookings",
    //   select: "date status tutor subject",
    //   populate: {
    //     path: "tutor",
    //     select: "name email",
    //   },
    // });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.status(200).json({
      success: true,
      data: studentProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student profile",
      error: error.message,
    });
  }
};

// controller/Profile/studentprofileController.js

const getStudentProfileById = async (req, res) => {
  try {
    const studentId = req.params.id;
    // console.log(studentId, "popopopopsssss");
    const studentProfile = await StudentProfileModel.findOne({
      userId: studentId,
    })
      .populate("userId", "firstName lastName phone role profilePhoto email ")
      .populate({
        path: "enrolledCourses.courseId",
        select:
          "courseTitle courseDescription coursePrice courseInstructor courseCategory",
        populate: {
          path: "courseInstructor",
          select: "name email",
        },
      });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // console.log(studentProfile, "popopopopopopopopooo");
    res.status(200).json({
      success: true,
      data: studentProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching student profile by ID",
      error: error.message,
    });
  }
};

const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, search } = req.query;

    const studentProfile = await StudentProfileModel.findOne({ userId })
      .select("enrolledCourses")
      .populate({
        path: "enrolledCourses.courseId",
        select: "-__v",
        populate: {
          path: "courseInstructor",
          select: "name email profileImage firstName lastName",
        },
      });

    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    let filteredData = studentProfile.enrolledCourses;
    // console.log(filteredData, "filtereddata");
    // Apply search filter if search query is provided
    if (search) {
      filteredData = filteredData.filter(
        (course) =>
          course.courseId &&
          course.courseId.courseTitle &&
          course.courseId.courseTitle
            .toLowerCase()
            .includes(search.toLowerCase()),
      );
    }

    let totalItems = filteredData.length;
    let totalPages = 1;
    let paginatedData = filteredData;

    // Apply pagination only if both page and limit are provided
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid pagination parameters. Page and limit must be positive numbers.",
        });
      }

      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      totalPages = Math.ceil(totalItems / limitNum);
      paginatedData = filteredData.slice(startIndex, endIndex);

      return res.status(200).json({
        success: true,
        data: paginatedData,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
        },
      });
    }

    // If no pagination parameters, return all filtered data
    res.status(200).json({
      success: true,
      data: paginatedData,
      totalItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching enrolled courses",
      error: error.message,
    });
  }
};

// const getEnrolledCourseIds = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const studentProfile = await StudentProfileModel.findOne({ userId }).select(
//       "enrolledCourses"
//     );

//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     const enrolledCourses = studentProfile.enrolledCourses;

//     res.status(200).json({
//       success: true,
//       data: enrolledCourses,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error fetching enrolled course IDs",
//       error: error.message,
//     });
//   }
// };

// const getEnrolledCourseIds = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const studentProfile = await StudentProfileModel.findOne({ userId }).select("enrolledCourses");

//     if (!studentProfile) {
//       return res.status(404).json({ success: false, message: "Student profile not found" });
//     }

//     const enrichedCourses = await Promise.all(
//       studentProfile.enrolledCourses.map(async (course) => {
//         let courseData = null;

//         try {
//           courseData = await CourseModel.findById(course.courseId).select("title description thumbnail instructor category");
//         } catch (err) {
//           console.warn(`Failed to fetch course for ID: ${course.courseId}`, err);
//         }

//         return {
//           ...course.toObject(),
//           courseData: courseData || { _id: course.courseId }, // fallback to avoid frontend break
//         };
//       })
//     );

//     res.status(200).json({
//       success: true,
//       data: enrichedCourses,
//     });
//   } catch (error) {
//     console.error("Error in getEnrolledCourseIds:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching enrolled course details",
//       error: error.message,
//     });
//   }
// };

const getEnrolledCourseIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const studentProfile = await StudentProfileModel.findOne({ userId }).select(
      "enrolledCourses",
    );

    if (!studentProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Student profile not found" });
    }

    const enrichedCourses = await Promise.all(
      studentProfile.enrolledCourses.map(async (course) => {
        let courseData = null;

        try {
          courseData = await CourseModel.findById(course.courseId)
            .select("-__v") // optional: exclude __v
            .populate("courseCategory", "name") // assuming category has a 'name' field
            .populate("courseSubCategory", "name") // same here
            .populate("courseInstructor", "firstName lastName email"); // adjust as per your User schema
        } catch (err) {
          console.warn(
            `Failed to fetch course for ID: ${course.courseId}`,
            err,
          );
        }
        const scholarships = await ScholarshipModel.find({
          student: userId,
          course: course?.courseId,
        });
        let isSchollarRequested;
        if (Array.isArray(scholarships)) {
          isSchollarRequested = scholarships.some(
            (s) => s.status !== "rejected",
          );
        } else {
          isSchollarRequested =
            scholarships?.status !== "rejected" ? true : false;
        }

        return {
          ...course.toObject(),
          courseData: courseData || { _id: course.courseId },
          isSchollarRequested,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: enrichedCourses,
    });
  } catch (error) {
    console.error("Error in getEnrolledCourseIds:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrolled course details",
      error: error.message,
    });
  }
};

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );

//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(404).json({ message: "Course not Completed" });
//     }

//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // Log student data
//     console.log("Student Certificate Data:", studentData);

//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, renderedData) => {
//         if (err) {
//           console.error("Render Error:", err);
//           reject(err);
//         } else {
//           console.log("Rendered HTML for PDF:", renderedData);
//           resolve(renderedData);
//         }
//       });
//     });

//     const pdfPath = path.join(
//       __dirname,
//       "../../public/certificates",
//       "certificate.pdf"
//     );

//     pdf
//       .create(html, {
//         format: "pdf",
//       })
//       .toFile(pdfPath, async (err) => {
//         if (err) {
//           console.error("PDF Generation Error:", err);
//           return res.status(500).json({ error: "Failed to generate PDF" });
//         }

//         const fileBuffer = fs.readFileSync(pdfPath);
//         const fileStr = `data:application/pdf;base64,${fileBuffer.toString(
//           "base64"
//         )}`;

//         cloudinary.uploader.upload(
//           fileStr,
//           {
//             resource_type: "auto",
//             format: "pdf",
//             folder: "certificates",
//           },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary Upload Error:", error);
//               return res.status(500).json({ error: "Failed to upload PDF" });
//             }

//             console.log("Cloudinary Upload Result:", result);

//             res.status(200).json({
//               status: "success",
//               message: "pdf generated",
//               pdfUrl: result.secure_url,
//             });
//           }
//         );
//       });
//   } catch (error) {
//     console.error("Internal Server Error:", error);
//     res.status(500).json({ status: "failed", error: error.message });
//   }
// };

// ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌

//  const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // Find enrolled course
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );

//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(404).json({ message: "Course not Completed" });
//     }

//     // Prepare certificate data
//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // Render HTML from EJS template
//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, renderedData) => {
//         if (err) {
//           console.error("Render Error:", err);
//           reject(err);
//         } else {
//           resolve(renderedData);
//         }
//       });
//     });

//     // Path to save the PDF temporarily
//     const pdfPath = path.join(
//       __dirname,
//       "../../public/certificates",
//       "certificate.pdf"
//     );

//     // Generate PDF and save locally
//     pdf
//       .create(html, { format: "A4" })
//       .toFile(pdfPath, async (err) => {
//         if (err) {
//           console.error("PDF Generation Error:", err);
//           return res.status(500).json({ error: "Failed to generate PDF" });
//         }

//         // Read the generated PDF file
//         const fileBuffer = fs.readFileSync(pdfPath);

//         // Upload PDF buffer to Cloudinary using stream
//         cloudinary.uploader.upload_stream(
//           {
//             resource_type: "raw", // for PDF files
//             folder: "certificates",
//             format: "pdf",
//           },
//           (error, result) => {
//             if (error) {
//               console.error("Cloudinary Upload Error:", error);
//               return res.status(500).json({ error: "Failed to upload PDF" });
//             }

//             // Optionally delete local PDF after upload
//             fs.unlinkSync(pdfPath);

//             // Respond with uploaded PDF URL
//             return res.status(200).json({
//               status: "success",
//               message: "pdf generated",
//               pdfUrl: result.secure_url,
//             });
//           }
//         ).end(fileBuffer); // Send buffer to Cloudinary stream
//       });
//   } catch (error) {
//     console.error("Internal Server Error:", error);
//     return res.status(500).json({ status: "failed", error: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // 1. Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // 2. Check course completion
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );
//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(404).json({ message: "Course not completed" });
//     }

//     // 3. Prepare data for certificate
//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     console.log("Student Certificate Data:", studentData);

//     // 4. Render HTML for PDF
//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, renderedData) => {
//         if (err) {
//           console.error("Render Error:", err);
//           return reject(err);
//         }
//         resolve(renderedData);
//       });
//     });

//     // 5. PDF generation options
//     const pdfOptions = {
//       format: "A4",
//       orientation: "landscape",
//       border: {
//         top: "0.5in",
//         right: "0.5in",
//         bottom: "0.5in",
//         left: "0.5in"
//       },
//       quality: "75",
//       renderDelay: 1000,
//       timeout: 30000
//     };

//     // 6. Generate PDF and send directly to client
//     pdf.create(html, pdfOptions).toBuffer((err, buffer) => {
//       if (err) {
//         console.error("PDF Generation Error:", err);
//         return res.status(500).json({ error: "Failed to generate PDF" });
//       }

//       try {
//         // Create sanitized filename for download
//         const sanitizedStudentName = studentData.studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//         const sanitizedCourseTitle = studentData.courseTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//         const filename = `Certificate_${sanitizedStudentName}_${sanitizedCourseTitle}.pdf`;

//         // Set headers for PDF download
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
//         res.setHeader('Content-Length', buffer.length);
//         res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
//         res.setHeader('Pragma', 'no-cache');
//         res.setHeader('Expires', '0');

//         // Send PDF buffer to client
//         res.send(buffer);

//         console.log(`Certificate generated and downloaded successfully for ${studentData.studentName}`);

//       } catch (error) {
//         console.error("Error sending PDF:", error);
//         res.status(500).json({ error: "Failed to send PDF" });
//       }
//     });

//   } catch (error) {
//     console.error("Internal Server Error:", error);
//     res.status(500).json({ status: "failed", error: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // 1. Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // 2. Check course completion
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );
//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(400).json({ message: "Course not completed" });
//     }

//     // 3. Prepare certificate data
//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // 4. Render EJS to HTML string
//     const html = await ejs.renderFile(
//       path.join(__dirname, "../../view/certificate.ejs"),
//       studentData
//     );

//     // 5. Launch Puppeteer browser
//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"], // required for VPS
//     });
//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: "load",
//     });

//     // 6. Generate PDF from rendered HTML
//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       landscape: true,
//       printBackground: true,
//       margin: {
//         top: "0.5in",
//         bottom: "0.5in",
//         left: "0.5in",
//         right: "0.5in",
//       },
//     });

//     await browser.close();

//     // 7. Send PDF to client
//     const sanitizedStudentName = studentData.studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//     const sanitizedCourseTitle = studentData.courseTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//     const filename = `Certificate_${sanitizedStudentName}_${sanitizedCourseTitle}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Content-Length", pdfBuffer.length);
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     res.send(pdfBuffer);

//     console.log(`✅ Certificate generated for ${studentData.studentName}`);

//   } catch (error) {
//     console.error("❌ Error generating certificate:", error);
//     res.status(500).json({ error: "Internal Server Error", message: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // 1. Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // 2. Check course completion
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );
//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(400).json({ message: "Course not completed" });
//     }

//     // 3. Prepare certificate data
//     const studentData = {
//       certificateId: userId,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // 4. Render certificate EJS to HTML
//     const html = await ejs.renderFile(
//       path.join(__dirname, "../../view/certificate.ejs"),
//       studentData
//     );

//     // 5. Generate PDF using Puppeteer
//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"], // Needed on VPS
//     });

//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "load" });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       landscape: true,
//       printBackground: true,
//       margin: {
//         top: "0.5in",
//         bottom: "0.5in",
//         left: "0.5in",
//         right: "0.5in",
//       },
//     });

//     await browser.close();

//     // 6. Send the PDF as download
//     const sanitizedStudentName = studentData.studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//     const sanitizedCourseTitle = studentData.courseTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
//     const filename = `Certificate_${sanitizedStudentName}_${sanitizedCourseTitle}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
//     res.setHeader("Pragma", "no-cache");
//     res.setHeader("Expires", "0");

//     res.send(pdfBuffer);
//     console.log(`✅ Certificate sent for ${studentData.studentName}`);
//   } catch (error) {
//     console.error("❌ PDF Generation Error:", error);
//     res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) return res.status(404).json({ message: "Student profile not found" });

//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );
//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(404).json({ message: "Course not completed" });
//     }

//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, renderedHtml) => {
//         if (err) return reject(err);
//         resolve(renderedHtml);
//       });
//     });

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       landscape: true,
//       printBackground: true,
//     });

//     await browser.close();

//     const filename = `Certificate_${studentData.studentName.replace(/\s+/g, '_')}.pdf`;

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
//     res.send(pdfBuffer);

//   } catch (error) {
//     console.error("PDF generation error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// ❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // 1. Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // 2. Find the enrolled course
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );

//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(400).json({ message: "Course not completed" });
//     }

//     // 3. Prepare certificate data
//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // 4. Render HTML using EJS
//     const html = await new Promise((resolve, reject) => {
//       renderFile(
//         path.join(__dirname, "../../views/certificate.ejs"),
//          studentData,
//         (err, htmlData) => {
//           if (err) {
//             console.error("EJS Render Error:", err);
//             return reject(err);
//           }
//           resolve(htmlData);
//         }
//       );
//     });

//     // 5. Generate PDF using Puppeteer
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfPath = path.join(__dirname, `../../temp/certificate_${userId}.pdf`);
//     await page.pdf({ path: pdfPath, format: "A4" });

//     await browser.close();

//     // 6. Upload to Cloudinary
//     const cloudRes = await cloudinary.uploader.upload(pdfPath, {
//       resource_type: "raw",
//       folder: "certificates",
//       public_id: `certificate_${userId}`,
//     });

//     // 7. Delete local temp file
//     await unlinkAsync(pdfPath);

//     // 8. Send Cloudinary PDF URL in response
//     return res.status(200).json({
//       status: "success",
//       message: "PDF generated and uploaded successfully",
//       pdfUrl: cloudRes.secure_url,
//     });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return res.status(500).json({ status: "failed", error: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     // 1. Fetch student profile
//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     // 2. Find the enrolled course
//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );

//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(400).json({ message: "Course not completed" });
//     }

//     // 3. Prepare certificate data
//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     // 4. Render HTML using EJS
//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, htmlData) => {
//         if (err) {
//           console.error("EJS Render Error:", err);
//           return reject(err);
//         }
//         resolve(htmlData);
//       });
//     });

//     // 5. Save path for generated PDF
//     const outputPath = path.join(__dirname, "../../public/certificates", `certificate_${userId}.pdf`);

//     // 6. Generate PDF from HTML
//     pdf.create(html, { format: "A4" }).toFile(outputPath, async (err, result) => {
//       if (err) {
//         console.error("PDF Generation Error:", err);
//         return res.status(500).json({ error: "Failed to generate PDF" });
//       }

//       // 7. Send file as a direct download
//       res.download(outputPath, `certificate_${userId}.pdf`, (err) => {
//         if (err) {
//           console.error("Download Error:", err);
//         }

//         // Delete file after download
//         fs.unlink(outputPath, () => {});
//       });
//     });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return res.status(500).json({ status: "failed", error: error.message });
//   }
// };

// const generateCertificate = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const studentProfile = await StudentProfileModel.findOne({ userId });
//     if (!studentProfile) {
//       return res.status(404).json({ message: "Student profile not found" });
//     }

//     const enrolledCourse = studentProfile.enrolledCourses.find(
//       (course) => course.courseId.toString() === courseId
//     );

//     if (!enrolledCourse || !enrolledCourse.isCompleted) {
//       return res.status(400).json({ message: "Course not completed" });
//     }

//     const studentData = {
//       certificateId: req.user.id,
//       studentName: enrolledCourse.certificate.studentName,
//       courseTitle: enrolledCourse.certificate.courseTitle,
//       completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
//       instructorName: enrolledCourse.certificate.instructorName,
//       organizationName: "Your Organization",
//     };

//     const html = await new Promise((resolve, reject) => {
//       res.render("certificate", studentData, (err, htmlData) => {
//         if (err) return reject(err);
//         resolve(htmlData);
//       });
//     });

//     const browser = await puppeteer.launch({ headless: "new" });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfPath = path.join(__dirname, "../../public/certificates", `certificate_${userId}.pdf`);
//     await page.pdf({ path: pdfPath, format: "A4" });

//     await browser.close();

//     res.download(pdfPath, `certificate_${userId}.pdf`, (err) => {
//       if (err) console.error("Download Error:", err);
//       fs.unlink(pdfPath, () => {});
//     });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return res.status(500).json({ status: "failed", error: error.message });
//   }
// };

const generateCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const studentProfile = await StudentProfileModel.findOne({ userId });
    if (!studentProfile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const enrolledCourse = studentProfile.enrolledCourses.find(
      (course) => course.courseId.toString() === courseId,
    );

    if (!enrolledCourse || !enrolledCourse.isCompleted) {
      return res.status(400).json({ message: "Course not completed" });
    }

    const certificateData = {
      certificateId: req.user.id,
      studentName: enrolledCourse.certificate.studentName,
      courseTitle: enrolledCourse.certificate.courseTitle,
      completionDate: enrolledCourse.certificate.completionDate.split("T")[0],
      instructorName: enrolledCourse.certificate.instructorName,
      organizationName: "Your Organization",
    };

    // Log all certificate info to console
    // console.log("Certificate Data:");
    // console.log("Student Name:", certificateData.studentName);
    // console.log("Course Title:", certificateData.courseTitle);
    // console.log("Completion Date:", certificateData.completionDate);
    // console.log("Instructor Name:", certificateData.instructorName);
    // console.log("Organization:", certificateData.organizationName);
    // console.log("Certificate ID:", certificateData.certificateId);

    return res.status(200).json({
      message: "Certificate data retrieved successfully",
      certificate: certificateData,
    });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ status: "failed", error: error.message });
  }
};

module.exports = {
  getStudentProfile,
  getEnrolledCourses,
  getEnrolledCourseIds,
  generateCertificate,
  getStudentProfileById,
};
