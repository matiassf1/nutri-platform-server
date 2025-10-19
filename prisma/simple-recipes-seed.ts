import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.error("🌱 Iniciando seed simple de recetas...");

  try {
    await prisma.$connect();
    console.error("✅ Conectado a la base de datos");

    // Buscar un nutricionista existente
    const nutritionist = await prisma.user.findFirst({
      where: { role: "PRO" },
    });

    if (!nutritionist) {
      console.error(
        "❌ No se encontró nutricionista. Ejecuta primero: npm run db:seed"
      );
      process.exit(1);
    }

    console.error(`👨‍⚕️ Usando nutricionista: ${nutritionist.name}`);

    // Crear una receta simple
    const recipe = await prisma.recipe.create({
      data: {
        name: "Ensalada Simple de Prueba",
        authorId: nutritionist.id,
        title: "Ensalada Simple de Prueba",
        description: "Una ensalada básica para testing",
        image:
          "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
        cookTime: 10,
        prepTime: 15,
        servings: 2,
        difficulty: "EASY",
        tags: ["ensalada", "vegetariano"],
        allergens: [],
        isActive: true,
        createdBy: nutritionist.id,
        ingredients: {
          create: [
            {
              name: "Lechuga",
              amount: 1,
              unit: "cabeza",
              notes: "Lavar bien",
            },
            {
              name: "Tomate",
              amount: 2,
              unit: "unidades",
              notes: "Cortar en cubos",
            },
          ],
        },
        nutrition: {
          create: {
            calories: 50,
            protein: 2,
            carbs: 10,
            fat: 1,
            fiber: 3,
            sugar: 5,
            sodium: 10,
            cholesterol: 0,
          },
        },
      },
    });

    console.error(`✅ Receta creada: ${recipe.title} (ID: ${recipe.id})`);
    console.error("🎉 Seed simple de recetas completado!");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
