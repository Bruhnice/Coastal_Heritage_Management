const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, checkRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// 🧑 SUBMIT SUGGESTION (Viewer)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { siteId, content } = req.body;

    if (!siteId || !content) {
      return res.status(400).send("Missing fields");
    }

    const suggestion = await prisma.siteSuggestion.create({
      data: {
        siteId: Number(siteId),
        content,
        userId: req.user.id,
      },
    });

    // 🔴 REAL-TIME UPDATE
    const io = req.app.get("io");
    io.emit("suggestionUpdated");

    res.json(suggestion);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating suggestion");
  }
});

// 📋 GET PENDING (Admin)
router.get("/", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  try {
    const suggestions = await prisma.siteSuggestion.findMany({
      where: { status: "PENDING" },
      include: {
        site: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading suggestions");
  }
});

// 🔢 COUNT (Admin sidebar badge)
router.get("/count", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  try {
    const count = await prisma.siteSuggestion.count({
      where: { status: "PENDING" },
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error counting suggestions");
  }
});

// ✅ APPROVE
router.put(
  "/:id/approve",
  verifyToken,
  checkRole(["ADMIN"]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const suggestion = await prisma.siteSuggestion.findUnique({
        where: { id },
      });

      if (!suggestion) return res.status(404).send("Not found");

      // ✏️ APPLY CHANGE TO SITE
      await prisma.heritageSite.update({
        where: { id: suggestion.siteId },
        data: {
          description: suggestion.content,
        },
      });

      // ✅ UPDATE STATUS
      await prisma.siteSuggestion.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      // 🔔 NOTIFY USER
      await prisma.notification.create({
        data: {
          userId: suggestion.userId,
          message: "Your suggestion was approved",
        },
      });

      // 🔴 REAL-TIME UPDATE
      const io = req.app.get("io");
      io.emit("suggestionUpdated");

      res.send("Approved");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error approving suggestion");
    }
  },
);

// ❌ REJECT
router.put(
  "/:id/reject",
  verifyToken,
  checkRole(["ADMIN"]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const suggestion = await prisma.siteSuggestion.update({
        where: { id },
        data: { status: "REJECTED" },
      });

      // 🔔 NOTIFY USER
      await prisma.notification.create({
        data: {
          userId: suggestion.userId,
          message: "Your suggestion was rejected",
        },
      });

      // 🔴 REAL-TIME UPDATE
      const io = req.app.get("io");
      io.emit("suggestionUpdated");

      res.send("Rejected");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error rejecting suggestion");
    }
  },
);

module.exports = router;
