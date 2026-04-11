const express = require("express");
const multer = require("multer");

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// upload route
router.post("/", upload.single("file"), (req, res) => {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
  res.json({
    message: "File uploaded",
    url: `${backendUrl}/uploads/${req.file.filename}`,
  });
});

module.exports = router;
