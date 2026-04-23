const { default: mongoose } = require("mongoose");
const Quiz = require("../model/Quiz");
const UserModel = require("../model/UserModel");
const UserQuiz = require("../model/QuizResult");

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

exports.createQuiz = async (req, res) => {
  const teacherId = req.user.id;
  // const teacherId = '686f9142a0210883e1143422'; // development porpose
  const { title, description, subject, questions, start, end } = req.body;

  if (!title || !description || !teacherId || !questions || !start || !end)
    return res.status(400).json({
      message: `All fields are required | title: ${title}, description: ${description}, subject: ${subject}, teacherId: ${teacherId}, questions: ${questions}, start: ${start}, end: ${end}`,
      success: true,
    });
  console.log({ start, end });
  try {
    const quizStartDate = new Date(start);
    const startOfMonth = new Date(
      quizStartDate.getFullYear(),
      quizStartDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      quizStartDate.getFullYear(),
      quizStartDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const isExist = await Quiz.findOne({
      teacher: teacherId,
      subject: subject,
      quizStart: { $gte: startOfMonth, $lte: endOfMonth },
    });
    if (isExist)
      return res.status(400).json({
        message: `Quiz already exists for this subject: ${subject} and month`,
        success: false,
      });
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime; // difference in milliseconds
    const diffMinutes = diffMs / (1000 * 60);
    const quiz = await Quiz.create({
      title: title,
      description: description,
      teacher: teacherId,
      subject: subject,
      quizStart: start,
      quizEnd: end,
      questions: questions,
      durationInMinutes: Number(diffMinutes),
    });

    if (!quiz)
      return res
        .status(409)
        .json({ message: "Quiz not created", success: false });

    return res.status(201).json({
      message: "quiz created successfully",
      quiz: quiz,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create quiz.", error: error.message });
  }
};

exports.getCurrentMonthQuizByTeacher = async (req, res) => {
  const { teacherId } = req.params;
  const currentDate = new Date(Date.now());

  if (!mongoose.Types.ObjectId.isValid(teacherId))
    return res
      .status(422)
      .json({ message: "Invalid teacherId", success: false });

  try {
    const quizzes = await Quiz.find({
      teacher: teacherId,
      quizEnd: { $gte: currentDate },
    });

    return res.status(200).json({ quizzes: quizzes, success: true });
  } catch (error) {
    console.error(error);
    return res.json({
      message: "Failed to get current month quiz.",
      error: error.message,
    });
  }
};

exports.quizById = async (req, res) => {
  const { quizId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(quizId))
    return res.status(422).json({ message: "Invalid quizId", success: false });

  try {
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz)
      return res
        .status(404)
        .json({ message: "Quiz not found", success: false });

    return res.status(200).json({ quiz: quiz, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to get quiz by id.", error: error.message });
  }
};

exports.createQuizResult = async (req, res) => {
  const { quizId, score } = req.body;
  const studentId = req.user.id;

  if (!quizId)
    return res.status(422).json({ message: "Invalid quizId", success: false });
  if (!studentId)
    return res
      .status(422)
      .json({ message: "Invalid studentId", success: false });
  if (!score || typeof score !== "number")
    return res.status(422).json({ message: "Invalid score", success: false });
  if (score < 0 || score > 100)
    return res.status(422).json({ message: "Invalid score", success: false });

  try {
    const [quiz, student] = await Promise.all([
      Quiz.findById(quizId),
      UserModel.findById(studentId),
    ]);

    if (!quiz)
      return res
        .status(404)
        .json({ message: "Quiz not found", success: false });
    if (!student)
      return res
        .status(404)
        .json({ message: "Student not found", success: false });

    const quizResult = await UserQuiz.create({
      student: student._id,
      student: student._id,
      quiz: quiz._id,
      score: score,
    });

    if (!quizResult)
      return res.status(500).json({
        message: "Failed to create quiz result.",
        error: error.message,
      });

    return res.status(201).json({ quizResult: quizResult, success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to create quiz result.", error: error.message });
  }
};

exports.userPerformance = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(422).json({ message: "Invalid user id", success: false });

  // const studentId = new mongoose.Types.ObjectId('67c97f88900630247e3d238c'); // Static for now
  const studentId = new mongoose.Types.ObjectId(id);
  if (!studentId)
    return res
      .status(422)
      .json({ message: "Invalid studentId", success: false });

  try {
    const now = new Date();
    const twelveMonths = [];

    // Step 1: Build array of last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      twelveMonths.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1, // 1-based
        name: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
        totalScore: 0,
      });
    }

    const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Step 2: Aggregate from DB
    const scores = await UserQuiz.aggregate([
      {
        $match: { student: studentId, createdAt: { $gte: fromDate } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalScore: { $sum: "$score" },
        },
      },
    ]);

    // Step 3: Merge actual scores into the 12-month array
    const performance = twelveMonths.map((monthObj) => {
      const match = scores.find(
        (s) => s._id.year === monthObj.year && s._id.month === monthObj.month,
      );
      return {
        name: monthObj.name,
        totalScore: match ? match.totalScore : 0,
      };
    });

    const student = await UserModel.findById(studentId);

    return res.status(200).json({
      message: "User performance score by month (sum)",
      performance: performance,
      student: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get user performance.",
      error: error.message,
    });
  }
};

exports.currentUserPerformance = async (req, res) => {
  const id = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(422).json({ message: "Invalid user id", success: false });

  // const studentId = new mongoose.Types.ObjectId('67c97f88900630247e3d238c'); // Static for now
  const studentId = new mongoose.Types.ObjectId(id);
  if (!studentId)
    return res
      .status(422)
      .json({ message: "Invalid studentId", success: false });

  try {
    const now = new Date();
    const twelveMonths = [];

    // Step 1: Build array of last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      twelveMonths.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1, // 1-based
        name: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
        totalScore: 0,
      });
    }

    const fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Step 2: Aggregate from DB
    const scores = await UserQuiz.aggregate([
      {
        $match: { student: studentId, createdAt: { $gte: fromDate } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalScore: { $sum: "$score" },
        },
      },
    ]);

    // Step 3: Merge actual scores into the 12-month array
    const performance = twelveMonths.map((monthObj) => {
      const match = scores.find(
        (s) => s._id.year === monthObj.year && s._id.month === monthObj.month,
      );
      return {
        name: monthObj.name,
        totalScore: match ? match.totalScore : 0,
      };
    });

    return res.status(200).json({
      message: "User performance score by month (sum)",
      performance: performance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get user performance.",
      error: error.message,
    });
  }
};

exports.allQuizStudents = async (req, res) => {
  const quizId = req.params.quizId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(quizId))
    return res.status(400).json({ message: "Invalid quiz ID", success: false });

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ message: "Quiz not found", success: false });

    const [students, total] = await Promise.all([
      await UserQuiz.find({ quiz: quizId })
        .populate("student", "firstName lastName")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      await UserQuiz.countDocuments({ quiz: quizId }),
    ]);

    const pagination = {
      page: page,
      total: total,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json({
      message: "All quiz students",
      success: true,
      pagination: pagination,
      students: students,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get all quiz students.",
      error: error.message,
    });
  }
};

exports.quizResultsByStudent = async (req, res) => {
  const studentId = req.params.studentId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(studentId))
    return res
      .status(400)
      .json({ message: "Invalid student ID", success: false });

  try {
    const student = await UserModel.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ message: "Student not found", success: false });

    const quizResults = await UserQuiz.find({ student: student._id })
      .populate("student", "firstName lastName")
      .populate("quiz", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await UserQuiz.countDocuments({ student: student._id });

    const pagination = {
      page: page,
      total: total,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json({
      message: "Quiz results by student",
      success: true,
      pagination: pagination,
      quizResults: quizResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get quiz results by student.",
      error: error.message,
    });
  }
};

exports.quizResultsByCurrentStudent = async (req, res) => {
  const studentId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(studentId))
    return res
      .status(400)
      .json({ message: "Invalid student ID", success: false });

  try {
    const student = await UserModel.findById(studentId);
    if (!student)
      return res
        .status(404)
        .json({ message: "Student not found", success: false });

    const quizResults = await UserQuiz.find({ student: student._id })
      .populate("student", "firstName lastName")
      .populate("quiz", "title")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await UserQuiz.countDocuments({ student: student._id });

    const pagination = {
      page: page,
      total: total,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json({
      message: "Quiz results by student",
      success: true,
      pagination: pagination,
      quizResults: quizResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get quiz results by student.",
      error: error.message,
    });
  }
};

// exports.getAllQuizzes = async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   try {
//     const [quizzes, total] = await Promise.all([
//       Quiz.find()
//         .populate("teacher", "firstName lastName email")
//         .skip(skip)
//         .limit(limit)
//         .sort({ createdAt: -1 }),
//       Quiz.countDocuments(),
//     ]);

//     const pagination = {
//       page,
//       total,
//       totalPages: Math.ceil(total / limit),
//     };

//     return res.status(200).json({
//       message: "All quizzes fetched successfully",
//       success: true,
//       quizzes,
//       pagination,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Failed to fetch quizzes",
//       error: error.message,
//       success: false,
//     });
//   }
// };
exports.getAllQuizzes = async (req, res) => {
  const { id: studentId } = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [quizzes, total, submittedQuizzes] = await Promise.all([
      Quiz.find()
        .populate("teacher", "firstName lastName email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),

      Quiz.countDocuments(),

      UserQuiz.find({ student: studentId }).select("quiz"),
    ]);

    // Convert submitted quiz IDs into Set for fast lookup
    const submittedQuizIds = new Set(
      submittedQuizzes.map((q) => q.quiz.toString()),
    );

    // Add isQuizSubmitted field
    const enrichedQuizzes = quizzes.map((q) => ({
      ...q.toObject(),
      isQuizSubmitted: submittedQuizIds.has(q._id.toString()),
    }));

    const pagination = {
      page,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return res.status(200).json({
      message: "All quizzes fetched successfully",
      success: true,
      quizzes: enrichedQuizzes,
      pagination,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch quizzes",
      error: error.message,
      success: false,
    });
  }
};
