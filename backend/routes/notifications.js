const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const data = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// 🔥 NEW: Clear ALL notifications for the logged-in user
router.delete("/clear-all", verifyToken, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear all notifications" });
  }
});

// 🔥 UPDATED: Delete a single notification (Matches your frontend markAsRead)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership before deleting
    const note = await prisma.notification.findUnique({
      where: { id: Number(id) },
    });

    if (!note || note.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }

    await prisma.notification.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Notification removed" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification" });
  }
});

// Update read status (Optional, if you prefer updating over deleting)
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    });
    res.send("Read");
  } catch (err) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

module.exports = router;
