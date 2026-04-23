const Scholarship = require("../model/Scholarship.js");
const User = require("../model/UserModel.js");
const Course = require("../model/CourseModel.js");

// ---------------------------
// Student applies for scholarship
// ---------------------------
// const applyScholarship = async (req, res) => {
//   try {
//     const { course, amount, reason } = req.body;

//     if (!course || !amount) {
//       return res.status(400).json({ message: "Course and amount are required" });
//     }

//     const newScholarship = new Scholarship({
//       student: req.user.id,
//       course,
//       amount,
//       reason
//     });

//     await newScholarship.save();

//     res.status(201).json({ message: "Scholarship application submitted", scholarship: newScholarship });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const applyScholarship = async (req, res) => {
  try {
    const { course, amount, percentage, reason } = req.body;

    // Check course id
    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Must have amount or percentage
    if (!amount && !percentage) {
      return res.status(400).json({ message: "Either amount or percentage is required" });
    }

    // Fetch course
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!courseDoc.coursePrice || courseDoc.coursePrice <= 0) {
      return res.status(400).json({ message: "Course price is invalid" });
    }

    // Compute final amount
    let finalAmount = amount;
    if (percentage) {
      if (typeof percentage !== 'number' || percentage <= 0 || percentage > 100) {
        return res.status(400).json({ message: "Percentage must be between 1 and 100" });
      }

      finalAmount = Math.round((courseDoc.coursePrice * percentage) / 100);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        message: "Calculated amount must be greater than zero.",
        debug: {
          coursePrice: courseDoc.coursePrice,
          percentage,
          calculatedAmount: finalAmount
        }
      });
    }

    // Save scholarship
    const newScholarship = new Scholarship({
      student: req.user.id,
      course,
      amount: finalAmount,
      reason
    });

    await newScholarship.save();

    res.status(201).json({
      message: "Scholarship application submitted",
      scholarship: newScholarship
    });

  } catch (error) {
    console.error("[Error in applyScholarship]:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------
// Admin: Get all scholarships
// ---------------------------
const getAllScholarships = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const scholarships = await Scholarship.find(query)
      .populate("student", "firstName lastName email")
      .populate("course", "courseTitle");

    res.json({ scholarships });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------
// Admin: Approve/Reject scholarship
// ---------------------------
const updateScholarshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!["approved", "rejected","credited"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const scholarship = await Scholarship.findById(id);
    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    scholarship.status = status;
    if (adminNote) scholarship.adminNote = adminNote;

    await scholarship.save();

    res.json({ message: `Scholarship ${status}`, scholarship });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------------------
// Admin: Credit scholarship
// ---------------------------
const creditScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Find the scholarship
    const scholarship = await Scholarship.findById(id).populate("student");
    if (!scholarship) {
      return res.status(404).json({ message: "Scholarship not found" });
    }

    // 2️⃣ Check it is approved
    if (scholarship.status !== "approved") {
      return res.status(400).json({ message: "Scholarship must be approved before crediting" });
    }

    // 3️⃣ Increment earnings directly
    const updatedStudent = await User.findByIdAndUpdate(
      scholarship.student._id,
      { $inc: { earnings: scholarship.amount } },
      { new: true }
    );

    // 4️⃣ Mark scholarship as credited
    scholarship.status = "credited";
    await scholarship.save();

    // 5️⃣ Respond with success message and new status
    res.json({
      message: "Scholarship credit successfully completed.",
      scholarship: {
        _id: scholarship._id,
        status: scholarship.status,
        amount: scholarship.amount
      },
      student: {
        _id: updatedStudent._id,
        earnings: updatedStudent.earnings
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// ---------------------------
// Admin: Get student's courses
// ---------------------------
const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const courses = await Course.find({ courseInstructor: studentId });

    res.json({ studentId, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
 

const adminGrantScholarship = async (req, res) => {
  try {
    console.log("=== [adminGrantScholarship called] ===");
    console.log("Incoming request body:", req.body);

    const { studentId, courseId, amount, percentage, adminNote } = req.body;

    // Step 1: Validate studentId and courseId
    console.log("[Step 1] Validating studentId and courseId...");
    if (!studentId || !courseId) {
      console.warn("[Error] Missing studentId or courseId");
      return res.status(400).json({ message: "studentId and courseId are required" });
    }

    // Step 2: Check that either amount or percentage is provided
    console.log("[Step 2] Checking amount or percentage...");
    if (!amount && !percentage) {
      console.warn("[Error] Neither amount nor percentage provided");
      return res.status(400).json({ message: "Either amount or percentage is required" });
    }

    // Step 3: Validate student
    console.log("[Step 3] Fetching student...");
    const student = await User.findById(studentId);
    if (!student) {
      console.warn("[Error] Student not found:", studentId);
      return res.status(404).json({ message: "Student not found" });
    }
    console.log("Student found:", student._id);

    // Step 4: Validate course
    console.log("[Step 4] Fetching course...");
    const course = await Course.findById(courseId);
    if (!course) {
      console.warn("[Error] Course not found:", courseId);
      return res.status(404).json({ message: "Course not found" });
    }
    console.log("Course found:", course._id, "Price:", course.coursePrice);

    // Step 5: Validate course price
    if (!course.coursePrice || course.coursePrice <= 0) {
      console.warn("[Error] Invalid course price:", course.coursePrice);
      return res.status(400).json({ message: "Course price must be greater than zero." });
    }

    // Step 6: Determine final amount
    let finalAmount = amount;
    if (percentage) {
      console.log("[Step 6] Percentage provided:", percentage);

      if (typeof percentage !== 'number' || percentage <= 0 || percentage > 100) {
        console.warn("[Error] Invalid percentage:", percentage);
        return res.status(400).json({ message: "Percentage must be between 1 and 100" });
      }

      console.log("Calculating amount based on percentage...");
      console.log("Course price:", course.coursePrice);
      console.log("Percentage:", percentage);

      finalAmount = Math.round((course.coursePrice * percentage) / 100);

      console.log("Calculated finalAmount:", finalAmount);
    } else {
      console.log("[Step 6] Using provided fixed amount:", finalAmount);
    }

    // Step 7: Final amount validation
    if (!finalAmount || finalAmount <= 0) {
      console.warn("[Error] Calculated amount is invalid:", finalAmount);
      return res.status(400).json({ 
        message: "Calculated amount must be greater than zero. Check course price and percentage.",
        debug: {
          coursePrice: course.coursePrice,
          percentage,
          calculatedAmount: finalAmount
        }
      });
    }

    // Step 8: Create scholarship
    console.log("[Step 8] Creating scholarship document...");
    const newScholarship = new Scholarship({
      student: studentId,
      course: courseId,
      amount: finalAmount,
      status: "approved",
      adminNote
    });
    await newScholarship.save();
    console.log("Scholarship created with ID:", newScholarship._id);

    // Step 9: Credit money to student
    console.log("[Step 9] Crediting student earnings...");
    await User.findByIdAndUpdate(
      studentId,
      { $inc: { earnings: finalAmount } },
      { new: true }
    );
    console.log("Student earnings updated by amount:", finalAmount);

    // Step 10: Mark scholarship as credited
    console.log("[Step 10] Marking scholarship as credited...");
    newScholarship.status = "credited";
    await newScholarship.save();
    console.log("Scholarship marked as credited.");

    // Step 11: Send response
    console.log("[Step 11] Sending success response...");
    res.status(201).json({
      message: "Scholarship granted and credited successfully.",
      creditedAmount: finalAmount,
      scholarship: newScholarship
    });

    console.log("=== [adminGrantScholarship completed successfully] ===");

  } catch (error) {
    console.error("[Unhandled Error in adminGrantScholarship]", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------------------
// Student: Get all their own scholarship requests
// ---------------------------
const getMyScholarships = async (req, res) => {
  try {
    const studentId = req.user.id;

    const scholarships = await Scholarship.find({ student: studentId })
      .populate("course", "courseTitle coursePrice");

    res.status(200).json({
      success: true,
      data: scholarships
    });
  } catch (error) {
    console.error("[Error in getMyScholarships]:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch your scholarships.",
      error: error.message
    });
  }
};

// ---------------------------
// Export all controllers
// ---------------------------
module.exports = {
  applyScholarship,
  getAllScholarships,
  updateScholarshipStatus,
  creditScholarship,
  getStudentCourses,
  adminGrantScholarship,
    getMyScholarships // 👈 Add this

};
