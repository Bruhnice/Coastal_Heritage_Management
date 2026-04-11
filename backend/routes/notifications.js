const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", verifyToken, async (req, res) => {
  const data = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
  });

  res.json(data);
});

//reads data from the database and updates the read status to true
router.put("/:id/read", verifyToken, async (req, res) => {
  await prisma.notification.update({
    where: { id: Number(req.params.id) },
    data: { read: true },
  });

  res.send("Read");
});

module.exports = router;
