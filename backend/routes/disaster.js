const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// CREATE
router.post('/', verifyToken, checkRole(['ADMIN', 'DRRM']), async (req, res) => {
  const data = await prisma.disasterEvent.create({ data: req.body });
  res.json(data);
});

// READ
router.get('/', async (req, res) => {
  const data = await prisma.disasterEvent.findMany({
    include: { location: true }
  });
  res.json(data);
});

// UPDATE
router.put('/:id', verifyToken, async (req, res) => {
  const data = await prisma.disasterEvent.update({
    where: { id: parseInt(req.params.id) },
    data: req.body
  });
  res.json(data);
});

// DELETE
router.delete('/:id', verifyToken, checkRole(['ADMIN']), async (req, res) => {
  await prisma.disasterEvent.delete({
    where: { id: parseInt(req.params.id) }
  });
  res.send("Deleted");
});

module.exports = router;
