const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  // ADMIN
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@test.com",
      password,
      role: "ADMIN"
    }
  });

  // DRRM Officer
  await prisma.user.create({
    data: {
      name: "DRRM Officer",
      email: "drrm@test.com",
      password,
      role: "DRRM"
    }
  });

  // Heritage Officer
  await prisma.user.create({
    data: {
      name: "Heritage Officer",
      email: "heritage@test.com",
      password,
      role: "HERITAGE"
    }
  });

  // Reporter
  await prisma.user.create({
    data: {
      name: "Reporter",
      email: "reporter@test.com",
      password,
      role: "REPORTER"
    }
  });

  // Viewer
  await prisma.user.create({
    data: {
      name: "Viewer",
      email: "viewer@test.com",
      password,
      role: "VIEWER"
    }
  });

  console.log("Seed users created!");
}

main();
