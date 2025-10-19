import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔌 Probando conexión a la base de datos...");
    await prisma.$connect();
    console.log("✅ Conexión exitosa!");

    // Probar una consulta simple
    const userCount = await prisma.user.count();
    console.log(`📊 Usuarios en la base de datos: ${userCount}`);

    const recipeCount = await prisma.recipe.count();
    console.log(`🍽️ Recetas en la base de datos: ${recipeCount}`);
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
