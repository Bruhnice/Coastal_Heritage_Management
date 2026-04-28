const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Set status: Reporters need manual approval, others (like Viewers) are auto-approved
    const status = role === "REPORTER" ? "PENDING" : "APPROVED";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        status,
      },
    });

    res.status(201).json({ message: "User registered successfully.", user });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Check if status is approved before allowing login
    if (user.status !== "APPROVED") {
      return res.status(403).json({
        message:
          "Your account is pending admin approval and cannot access the portal yet.",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
});

module.exports = router;
