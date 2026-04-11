const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, checkRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// GET USERS (ADMIN ONLY)
router.get("/", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// DELETE USER
router.delete("/:id", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  await prisma.user.delete({
    where: { id: parseInt(req.params.id) },
  });

  res.send("User deleted");
});

module.exports = router;
