const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, checkRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// 1. CREATE SITE
router.post(
  "/",
  verifyToken,
  checkRole(["ADMIN", "HERITAGE"]),
  async (req, res) => {
    try {
      const { name, description, status, locationId, imageUrl } = req.body;

      if (!name || !description || !status || !locationId) {
        return res.status(400).json({
          error: "name, description, status, and locationId are required",
        });
      }

      const data = await prisma.heritageSite.create({
        data: {
          name,
          description,
          status,
          locationId,
          imageUrl: imageUrl || null,
          createdBy: req.user.id,
        },
      });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating heritage site");
    }
  },
);

// 2. GET ALL SITES
router.get("/", async (req, res) => {
  try {
    const data = await prisma.heritageSite.findMany({
      include: {
        location: true,
        reports: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading heritage sites");
  }
});

// 🔥 NEW: OFFICIAL RATING ROUTE (For Reporters/Admins)
router.patch(
  "/:id/rate",
  verifyToken,
  checkRole(["ADMIN", "HERITAGE", "REPORTER"]),
  async (req, res) => {
    try {
      const { rating } = req.body;

      // Validate rating is between 1 and 5
      if (rating < 1 || rating > 5) {
        return res
          .status(400)
          .json({ error: "Rating must be between 1 and 5" });
      }

      const data = await prisma.heritageSite.update({
        where: { id: Number(req.params.id) },
        data: { officialRating: Number(rating) },
      });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating official rating");
    }
  },
);

// 3. FULL UPDATE (Admins/Heritage only)
router.put(
  "/:id",
  verifyToken,
  checkRole(["ADMIN", "HERITAGE"]),
  async (req, res) => {
    try {
      const data = await prisma.heritageSite.update({
        where: { id: Number(req.params.id) },
        data: req.body,
      });

      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating heritage site");
    }
  },
);

// 4. DELETE
router.delete("/:id", verifyToken, checkRole(["ADMIN"]), async (req, res) => {
  try {
    await prisma.heritageSite.delete({
      where: { id: Number(req.params.id) },
    });

    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting heritage site");
  }
});

module.exports = router;
