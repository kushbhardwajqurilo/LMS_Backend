// const express = require("express");
// const path = require("path");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// require("dotenv").config();
// const scholarshipRoutes = require("./src/route/scholarshipRoutes");

// // Route imports
// const courseRouter = require("./src/route/courseRoutes");
// const contactRouter = require("./src/route/contactRoutes");
// const authController = require("./src/route/authRoutes");
// const categoryRouter = require("./src/route/categoryRoute");
// const languageRouter = require("./src/route/languageRoute");
// const profileRouter = require("./src/route/profileRoute");
// const tutorRouter = require("./src/route/tutorRoutes");
// const bookingRouter = require("./src/route/bookingRoute");
// const subcategoryRouter = require("./src/route/subCategoryRoute");
// const wishListRouter = require("./src/route/wishlistRoute");
// const orderRouter = require("./src/route/orderRoute");
// const reviewRoute = require("./src/route/reviewRoute");
// const ticketRouter = require("./src/route/ticketRoute");
// const userRoutes = require("./src/route/userRoutes");
// const stripeRoute = require("./src/route/stripe");
// const walletRouter = require("./src/route/walletRoutes");
// const withdrawRouter = require("./src/route/withdrawRoute");
// const studentRouter = require("./src/route/studentRoutes");
// const teacherRouter = require("./src/route/teacherRoutes");
// const paymentRouter = require("./src/route/paymentRoutes");
// const tutorReviewRoute = require("./src/route/tutorReviewRoute");
// const adminRoute = require("./src/route/adminRoute");
// const emailTestRoutes = require("./src/routes/emailTestRoutes");
// const passwordRouter = require("./src/route/forgotPasswordRoutes");
// const routereeee = require("./src/route/testing");
// const earningRouter = require("./src/route/earningRoutes");
// const saleRouter = require("./src/route/saleRoutes");
// const frontendSettingRouter = require("./src/route/frontendSettingRoute");
// const emailSettingRouter = require("./src/route/emailSettingRoute");
// const paymentSettingRouter = require("./src/route/paymentSettingRoute");
// const payoutSettingRouter = require("./src/route/payoutSettingRoute");
// const quizRoute = require("./src/route/quizRoute");

// const app = express();

// // View engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "src", "view"));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static("public"));

// // ✅ Correct CORS setup
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "http://localhost:3000",
//       "https://lmsfrontend-wheat.vercel.app",
//       "https://lms.qurilo.com",
//       "http://localhost:3015",
//       "https://zg2n0wv5-3015.inc1.devtunnels.ms"
//     ];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }

//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // Preflight requests

// // Routes
// app.use("/api/auth", authController);
// app.use("/api/course", courseRouter);
// app.use("/api/category", categoryRouter);
// app.use("/api/languages", languageRouter);
// app.use("/api/bookings", bookingRouter);
// app.use("/api/profile", profileRouter);
// app.use("/api/tutors", tutorRouter);
// app.use("/api/subcategory", subcategoryRouter);
// app.use("/api/whishlist", wishListRouter);
// app.use("/api/order", orderRouter);
// app.use("/api/review", reviewRoute);
// app.use("/api/tutorReview", tutorReviewRoute);
// app.use("/api/ticket", ticketRouter);
// app.use("/api/users", userRoutes);
// app.use("/api/stripe", stripeRoute);
// app.use("/api/wallet", walletRouter);
// app.use("/api/withdrawals", withdrawRouter);
// app.use("/api/students", studentRouter);
// app.use("/api/teachers", teacherRouter);
// app.use("/api/forgotpassword", passwordRouter);
// app.use("/api/email", routereeee);
// app.use("/api/email-test", emailTestRoutes);
// app.use("/api/frontend-settings", frontendSettingRouter);
// app.use("/api/email-settings", emailSettingRouter);
// app.use("/api/payment-settings", paymentSettingRouter);
// app.use("/api/payout-settings", payoutSettingRouter);
// app.use("/api/admin", adminRoute);
// app.use("/api/payment", paymentRouter);
// app.use("/api/earnings", earningRouter);
// app.use("/api/sales", saleRouter);
// app.use("/api/contact", contactRouter);

// app.use("/api/quiz", quizRoute);
// app.use("/api/scholarships", scholarshipRoutes);

// // Example test page
// app.get("/login", (req, res) => {
//   res.render("login");
// });

// module.exports = app;

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ View engine setup
app.set("view engine", "ejs");
app.set("views", path.join("src", "view"));

// ✅ Middleware
app.use(express.json({ limit: "10000000mb" }));
app.use(express.urlencoded({ extended: true, limit: "100000mb" }));
app.use(cookieParser());
app.use(express.static("public"));

// ✅ Robust CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3015",
  "https://lmsfrontend-wheat.vercel.app",
  "https://lms.qurilo.com",
  "https://zg2n0wv5-3014.inc1.devtunnels.ms",
  "https://zg2n0wv5-3015.inc1.devtunnels.ms",
  "https://l3zz8htl-3015.inc1.devtunnels.ms",
  "https://school-management-system-pied-psi.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // for preflight requests

// ✅ Route imports
const scholarshipRoutes = require("./src/route/scholarshipRoutes");
const courseRouter = require("./src/route/courseRoutes");
const contactRouter = require("./src/route/contactRoutes");
const authController = require("./src/route/authRoutes");
const categoryRouter = require("./src/route/categoryRoute");
const languageRouter = require("./src/route/languageRoute");
const profileRouter = require("./src/route/profileRoute");
const tutorRouter = require("./src/route/tutorRoutes");
const bookingRouter = require("./src/route/bookingRoute");
const subcategoryRouter = require("./src/route/subCategoryRoute");
const wishListRouter = require("./src/route/wishlistRoute");
const orderRouter = require("./src/route/orderRoute");
const reviewRoute = require("./src/route/reviewRoute");
const tutorReviewRoute = require("./src/route/tutorReviewRoute");
const ticketRouter = require("./src/route/ticketRoute");
const userRoutes = require("./src/route/userRoutes");
const stripeRoute = require("./src/route/stripe");
const walletRouter = require("./src/route/walletRoutes");
const withdrawRouter = require("./src/route/withdrawRoute");
const studentRouter = require("./src/route/studentRoutes");
const teacherRouter = require("./src/route/teacherRoutes");
const paymentRouter = require("./src/route/paymentRoutes");
const passwordRouter = require("./src/route/forgotPasswordRoutes.js");
const emailTestRoutes = require("./src/routes/emailTestRoutes");
const routereeee = require("./src/route/testing");
const earningRouter = require("./src/route/earningRoutes");
const saleRouter = require("./src/route/saleRoutes");
const frontendSettingRouter = require("./src/route/frontendSettingRoute");
const emailSettingRouter = require("./src/route/emailSettingRoute");
const paymentSettingRouter = require("./src/route/paymentSettingRoute");
const payoutSettingRouter = require("./src/route/payoutSettingRoute");
const adminRoute = require("./src/route/adminRoute");
const quizRoute = require("./src/route/quizRoute");
const changePasswordRoutes = require("./src/route/changePasswordRoutes.js");
const documentRoutes = require("./src/route/documentRoutes.js");
const teacherProfileRoutes = require("./src/route/teacherProfileRoutes.js");
const lectureRouter = require("./src/route/lectureRoute.js");

// ✅ Route mounting
app.use("/api/auth", authController);
app.use("/api/allteachers", teacherProfileRoutes);
app.use("/api/change-password", changePasswordRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/course", courseRouter);
app.use("/api/category", categoryRouter);
app.use("/api/languages", languageRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/profile", profileRouter);
app.use("/api/tutors", tutorRouter);
app.use("/api/subcategory", subcategoryRouter);
app.use("/api/whishlist", wishListRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRoute);
app.use("/api/tutorReview", tutorReviewRoute);
app.use("/api/ticket", ticketRouter);
app.use("/api/users", userRoutes);
app.use("/api/stripe", stripeRoute);
app.use("/api/wallet", walletRouter);
app.use("/api/withdrawals", withdrawRouter);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/forgotpassword", passwordRouter);
app.use("/api/email", routereeee);
app.use("/api/email-test", emailTestRoutes);
app.use("/api/frontend-settings", frontendSettingRouter);
app.use("/api/email-settings", emailSettingRouter);
app.use("/api/payment-settings", paymentSettingRouter);
app.use("/api/payout-settings", payoutSettingRouter);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRouter);
app.use("/api/earnings", earningRouter);
app.use("/api/sales", saleRouter);
app.use("/api/contact", contactRouter);
app.use("/api/quiz", quizRoute);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/lecture", lectureRouter);

// Example test route
app.get("/login", (req, res) => {
  res.render("login");
});

module.exports = app;
