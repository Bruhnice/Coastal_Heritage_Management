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

// GET PENDING USERS (ADMIN ONLY)
router.get("/pending", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { status: "PENDING" },
  });
  res.json(users);
});

// APPROVE USER (ADMIN ONLY)
router.put(
  "/:id/approve",
  verifyToken,
  checkRole(["ADMIN"]),
  async (req, res) => {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "APPROVED" },
    });
    res.json(user);
  },
);

// REJECT USER (ADMIN ONLY)
router.put(
  "/:id/reject",
  verifyToken,
  checkRole(["ADMIN"]),
  async (req, res) => {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { status: "REJECTED" },
    });
    res.json(user);
  },
);

// DELETE USER
router.delete("/:id", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  await prisma.user.delete({
    where: { id: parseInt(req.params.id) },
  });

  res.send("User deleted");
});

module.exports = router;
