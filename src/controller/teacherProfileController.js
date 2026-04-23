const TeacherProfileModel = require("../model/teacherProfileModel");

exports.getAllTeacherProfiles = async (req, res) => {
  try {
    const teacherProfiles = await TeacherProfileModel.find({
      isExit: { $ne: true },
    })
      .populate("userId", "firstName lastName email profilePhoto") // Populate User basic info
      .populate("subjectsTaught", "name") // Subcategories (Subjects)
      .populate("languagesSpoken", "name") // Languages
      .populate("courses", "courseTitle courseCategory") // Courses taught
      .populate("tutionBookings") // You can specify fields if needed
      .populate("reviews"); // You can also specify fields like "rating comment"

    res.status(200).json({
      status: "success",
      message: "All teacher profiles fetched",
      data: teacherProfiles,
    });
  } catch (error) {
    console.error("Error fetching teacher profiles:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch teacher profiles",
      error: error.message,
    });
  }
};

exports.getTeacherProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacherProfile = await TeacherProfileModel.findById(id)
      .populate("userId", "firstName lastName email profilePhoto")
      .populate("subjectsTaught", "name")
      .populate("languagesSpoken", "name")
      .populate("courses", "courseTitle courseCategory")
      .populate("tutionBookings")
      .populate("reviews");

    if (!teacherProfile) {
      return res.status(404).json({
        status: "error",
        message: "Teacher profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Teacher profile fetched successfully",
      data: teacherProfile,
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch teacher profile",
      error: error.message,
    });
  }
};
