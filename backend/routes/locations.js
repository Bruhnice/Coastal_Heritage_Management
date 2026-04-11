const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// CREATE LOCATION
router.post('/', async (req, res) => {
  const { name, latitude, longitude } = req.body;

  const location = await prisma.location.create({
    data: { name, latitude, longitude }
  });

  res.json(location);
});

module.exports = router;
