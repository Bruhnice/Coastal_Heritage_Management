const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { verifyToken, checkRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/* =======================================================
   📝 CREATE REPORT (Reporter/Admin)
   ======================================================= */
router.post(
  "/",
  verifyToken,
  checkRole(["ADMIN", "DRRM", "HERITAGE", "REPORTER"]),
  async (req, res) => {
    try {
      const { heritageSiteId, category, details, imageUrl } = req.body;

      if (!heritageSiteId || !category || !details) {
        return res.status(400).json({
          error: "heritageSiteId, category, and details are required",
        });
      }

      const report = await prisma.damageReport.create({
        data: {
          heritageSiteId: Number(heritageSiteId),
          category,
          details,
          userId: req.user.id,
        },
      });

      res.json(report);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create report" });
    }
  },
);

/* =======================================================
   📋 GET APPROVED REPORTS (Public)
   ======================================================= */
router.get("/", async (req, res) => {
  try {
    const reports = await prisma.damageReport.findMany({
      where: { status: "APPROVED" }, // ✅ ONLY APPROVED
      include: {
        user: true,
        site: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

/* =======================================================
   📍 GET REPORTS PER SITE (All reports if authenticated, only approved if public)
   ======================================================= */
router.get("/site/:heritageSiteId", async (req, res) => {
  try {
    const heritageSiteId = Number(req.params.heritageSiteId);
    const authHeader = req.headers.authorization;
    const isAuthenticated = !!authHeader;

    // Authenticated users see all reports; public only sees approved
    const whereClause = {
      heritageSiteId,
    };
    if (!isAuthenticated) {
      whereClause.status = "APPROVED";
    }

    const reports = await prisma.damageReport.findMany({
      where: whereClause,
      include: {
        user: true,
        site: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load site reports" });
  }
});

/* =======================================================
   ✏️ UPDATE REPORT (Owner or Admin only)
   ======================================================= */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const { category, details } = req.body;

    // Find the report
    const report = await prisma.damageReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check if user is the owner or an admin
    if (report.userId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        error: "You can only edit your own reports",
      });
    }

    // Update the report
    const updated = await prisma.damageReport.update({
      where: { id: reportId },
      data: {
        category: category || report.category,
        details: details || report.details,
      },
      include: {
        user: true,
        site: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update report" });
  }
});

/* =======================================================
   🗑️ DELETE REPORT (Owner or Admin only)
   ======================================================= */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the report
    const report = await prisma.damageReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Check if user is the owner or an admin
    if (report.userId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        error: "You can only delete your own reports",
      });
    }

    // Delete the report
    await prisma.damageReport.delete({
      where: { id: reportId },
    });

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

module.exports = router;
