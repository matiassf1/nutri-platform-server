import { PrismaClient } from "@prisma/client";
import { seedRecipes } from "./seed-recipes";

const prisma = new PrismaClient();

async function main() {
  console.error("🌱 Iniciando seed solo de recetas...");

  try {
    await prisma.$connect();
    console.error("✅ Conectado a la base de datos");

    // Buscar un nutricionista existente o crear uno temporal
    let nutritionist = await prisma.user.findFirst({
      where: { role: "PRO" },
    });

    if (!nutritionist) {
      console.error("⚠️ No se encontró nutricionista, creando uno temporal...");
      nutritionist = await prisma.user.create({
        data: {
          email: "temp-nutritionist@example.com",
          name: "Nutricionista Temporal",
          password: "temp-password",
          role: "PRO",
          isActive: true,
        },
      });
    }

    console.error(`👨‍⚕️ Usando nutricionista: ${nutritionist.name}`);

    // Ejecutar seed de recetas
    await seedRecipes(prisma, nutritionist.id);

    console.error("🎉 Seed de recetas completado exitosamente!");
  } catch (error) {
    console.error("❌ Error durante el seed de recetas:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
