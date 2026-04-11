require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// ✅ UPDATED CORS: Added "PATCH" to allowed methods
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Added PATCH here
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const heritageRoutes = require("./routes/heritage");
const disasterRoutes = require("./routes/disaster");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const locationRoutes = require("./routes/locations");
const suggestionRoutes = require("./routes/suggestions");
const notificationRoutes = require("./routes/notifications");

// API routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/heritage", heritageRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));

// Test route
app.get("/", (req, res) => {
  res.send("API Running");
});

// 🔥 SOCKET.IO SETUP
// ✅ UPDATED SOCKET CORS: It's good practice to keep these synced
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"], // Added PATCH here as well
    credentials: true,
  },
});

// 🔥 MAKE IO GLOBAL
app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
