// require("dotenv").config();
// const dotenv = require("dotenv");
// const app = require("./app");
// const http = require("http");
// const connectDataBase = require("./src/config/db");

// const server = http.createServer(app);
// // Routes


// dotenv.config();

// // require("./src/upload/cronJob");
// require("./src/schedulers/settlementEarningScheduler")

// // connect database here
// connectDataBase();

// const PORT = process.env.PORT || 5000;


// server.listen(PORT, () => {
//   console.log(`the server is running at port ${process.env.PORT}`);
// }).on('error', (err) => {
//   console.error(`Failed to start server: ${err.message}`);
// });
 
// Load environment variables


require("dotenv").config();
const dotenv = require("dotenv");
dotenv.config();

// Import modules
const app = require("./app");
const http = require("http");
const connectDataBase = require("./src/config/db");

// Optional: Cron jobs / Schedulers
// require("./src/upload/cronJob");
require("./src/schedulers/settlementEarningScheduler");

// Create HTTP server
const server = http.createServer(app);

// Connect to the database
connectDataBase();

// Define PORT
const PORT = process.env.PORT || 3014;

// Start the server
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
}).on("error", (err) => {
  console.error(`❌ Failed to start server: ${err.message}`);
});
