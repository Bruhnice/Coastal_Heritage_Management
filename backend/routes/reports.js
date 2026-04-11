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
   📍 GET REPORTS PER SITE (Public)
   ======================================================= */
router.get("/site/:heritageSiteId", async (req, res) => {
  try {
    const heritageSiteId = Number(req.params.heritageSiteId);

    const reports = await prisma.damageReport.findMany({
      where: {
        heritageSiteId,
        status: "APPROVED", // ✅ ONLY APPROVED
      },
      include: {
        user: true,
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



module.exports = router;
