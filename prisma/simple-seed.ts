import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.error("Starting simple seed...");

  try {
    await prisma.$connect();
    console.error("Connected to database");

    // Crear un usuario simple
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: "hashedpassword",
        role: "USER",
        isActive: true,
      },
    });

    console.error("User created:", user.id);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
