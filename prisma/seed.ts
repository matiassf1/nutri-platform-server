import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Datos de recetas con información nutricional completa
const recipesData = [
  {
    title: "Ensalada César Saludable",
    description:
      "Una versión más saludable de la ensalada César tradicional, con aderezo casero y crutones de pan integral.",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
    cookTime: 15,
    prepTime: 20,
    servings: 4,
    difficulty: "EASY" as const,
    tags: ["ensalada", "vegetariano", "bajo-carbohidratos", "proteína"],
    allergens: ["gluten", "lácteos", "huevos"],
    isActive: true,
    ingredients: [
      {
        name: "Lechuga romana",
        amount: 1,
        unit: "cabeza",
        notes: "Lavar y cortar en trozos",
      },
      {
        name: "Pechuga de pollo",
        amount: 300,
        unit: "g",
        notes: "Cocida y cortada en tiras",
      },
      {
        name: "Pan integral",
        amount: 2,
        unit: "rebanadas",
        notes: "Para crutones",
      },
      { name: "Parmesano rallado", amount: 50, unit: "g", notes: "Fresco" },
      {
        name: "Aceite de oliva",
        amount: 3,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Ajo", amount: 2, unit: "dientes", notes: "Picado fino" },
      { name: "Anchoas", amount: 4, unit: "filetes", notes: "En aceite" },
      { name: "Mostaza Dijon", amount: 1, unit: "cucharadita", notes: "" },
      { name: "Limón", amount: 1, unit: "unidad", notes: "Jugo fresco" },
    ],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18,
      fiber: 4,
      sugar: 3,
      sodium: 680,
      cholesterol: 65,
    },
  },
  {
    title: "Salmón al Horno con Vegetales",
    description:
      "Salmón fresco cocido al horno con una mezcla de vegetales de temporada y hierbas aromáticas.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    cookTime: 25,
    prepTime: 15,
    servings: 4,
    difficulty: "EASY" as const,
    tags: ["pescado", "omega-3", "proteína", "vegetales", "horno"],
    allergens: ["pescado"],
    isActive: true,
    ingredients: [
      {
        name: "Filete de salmón",
        amount: 600,
        unit: "g",
        notes: "Sin piel, cortado en 4 porciones",
      },
      { name: "Brócoli", amount: 300, unit: "g", notes: "En floretes" },
      {
        name: "Zanahorias",
        amount: 200,
        unit: "g",
        notes: "Cortadas en bastones",
      },
      {
        name: "Calabacín",
        amount: 1,
        unit: "unidad",
        notes: "Cortado en rodajas",
      },
      {
        name: "Aceite de oliva",
        amount: 3,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Ajo", amount: 3, unit: "dientes", notes: "Picado" },
      { name: "Tomillo fresco", amount: 2, unit: "ramitas", notes: "" },
      { name: "Romero fresco", amount: 1, unit: "ramita", notes: "" },
      { name: "Sal marina", amount: 1, unit: "cucharadita", notes: "" },
      {
        name: "Pimienta negra",
        amount: 0.5,
        unit: "cucharadita",
        notes: "Recién molida",
      },
    ],
    nutrition: {
      calories: 285,
      protein: 35,
      carbs: 8,
      fat: 12,
      fiber: 3,
      sugar: 4,
      sodium: 420,
      cholesterol: 85,
    },
  },
  {
    title: "Quinoa con Pollo y Vegetales",
    description:
      "Bowl nutritivo de quinoa con pollo a la plancha, vegetales frescos y aderezo de tahini.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    cookTime: 20,
    prepTime: 25,
    servings: 4,
    difficulty: "MEDIUM" as const,
    tags: ["quinoa", "pollo", "vegetales", "proteína-completa", "fibra"],
    allergens: ["sésamo"],
    isActive: true,
    ingredients: [
      { name: "Quinoa", amount: 200, unit: "g", notes: "Lavada y escurrida" },
      {
        name: "Pechuga de pollo",
        amount: 400,
        unit: "g",
        notes: "Cortada en cubos",
      },
      {
        name: "Pimiento rojo",
        amount: 1,
        unit: "unidad",
        notes: "Cortado en tiras",
      },
      {
        name: "Pimiento amarillo",
        amount: 1,
        unit: "unidad",
        notes: "Cortado en tiras",
      },
      {
        name: "Cebolla morada",
        amount: 0.5,
        unit: "unidad",
        notes: "Cortada en aros",
      },
      { name: "Pepino", amount: 1, unit: "unidad", notes: "Cortado en cubos" },
      {
        name: "Tomate cherry",
        amount: 200,
        unit: "g",
        notes: "Cortados por la mitad",
      },
      { name: "Perejil fresco", amount: 30, unit: "g", notes: "Picado" },
      { name: "Menta fresca", amount: 15, unit: "g", notes: "Picada" },
      { name: "Tahini", amount: 3, unit: "cucharadas", notes: "" },
      { name: "Limón", amount: 1, unit: "unidad", notes: "Jugo fresco" },
      {
        name: "Aceite de oliva",
        amount: 2,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Ajo", amount: 2, unit: "dientes", notes: "Picado" },
      { name: "Comino", amount: 1, unit: "cucharadita", notes: "Molidos" },
      { name: "Sal", amount: 1, unit: "cucharadita", notes: "" },
    ],
    nutrition: {
      calories: 425,
      protein: 32,
      carbs: 45,
      fat: 14,
      fiber: 6,
      sugar: 8,
      sodium: 380,
      cholesterol: 70,
    },
  },
  {
    title: "Smoothie Verde Energético",
    description:
      "Smoothie nutritivo con espinacas, plátano, mango y proteína en polvo para un desayuno completo.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500",
    cookTime: 5,
    prepTime: 10,
    servings: 2,
    difficulty: "EASY" as const,
    tags: ["smoothie", "verde", "proteína", "desayuno", "vitaminas"],
    allergens: ["lácteos"],
    isActive: true,
    ingredients: [
      { name: "Espinacas frescas", amount: 60, unit: "g", notes: "Lavadas" },
      {
        name: "Plátano",
        amount: 1,
        unit: "unidad",
        notes: "Congelado, cortado en rodajas",
      },
      {
        name: "Mango",
        amount: 100,
        unit: "g",
        notes: "Congelado, cortado en cubos",
      },
      {
        name: "Leche de almendras",
        amount: 300,
        unit: "ml",
        notes: "Sin azúcar",
      },
      {
        name: "Proteína en polvo",
        amount: 30,
        unit: "g",
        notes: "Sabor vainilla",
      },
      { name: "Semillas de chía", amount: 1, unit: "cucharada", notes: "" },
      { name: "Miel", amount: 1, unit: "cucharada", notes: "Opcional" },
      { name: "Hielo", amount: 4, unit: "cubos", notes: "" },
    ],
    nutrition: {
      calories: 280,
      protein: 25,
      carbs: 35,
      fat: 6,
      fiber: 8,
      sugar: 28,
      sodium: 120,
      cholesterol: 0,
    },
  },
  {
    title: "Pasta Integral con Atún y Tomates",
    description:
      "Pasta integral con atún fresco, tomates cherry, albahaca y aceite de oliva extra virgen.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500",
    cookTime: 15,
    prepTime: 10,
    servings: 4,
    difficulty: "EASY" as const,
    tags: ["pasta", "atún", "tomate", "italiana", "carbohidratos-complejos"],
    allergens: ["gluten", "pescado"],
    isActive: true,
    ingredients: [
      {
        name: "Pasta integral",
        amount: 400,
        unit: "g",
        notes: "Spaghetti o linguini",
      },
      {
        name: "Atún fresco",
        amount: 300,
        unit: "g",
        notes: "Cortado en cubos",
      },
      {
        name: "Tomates cherry",
        amount: 300,
        unit: "g",
        notes: "Cortados por la mitad",
      },
      { name: "Ajo", amount: 3, unit: "dientes", notes: "Picado fino" },
      { name: "Albahaca fresca", amount: 20, unit: "g", notes: "Picada" },
      {
        name: "Aceite de oliva",
        amount: 4,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Vino blanco", amount: 100, unit: "ml", notes: "Opcional" },
      { name: "Sal", amount: 1, unit: "cucharadita", notes: "" },
      {
        name: "Pimienta roja",
        amount: 0.5,
        unit: "cucharadita",
        notes: "Hojuelas",
      },
      {
        name: "Parmesano rallado",
        amount: 50,
        unit: "g",
        notes: "Para servir",
      },
    ],
    nutrition: {
      calories: 485,
      protein: 28,
      carbs: 65,
      fat: 12,
      fiber: 8,
      sugar: 6,
      sodium: 520,
      cholesterol: 45,
    },
  },
  {
    title: "Ensalada de Garbanzos y Aguacate",
    description:
      "Ensalada nutritiva con garbanzos cocidos, aguacate, tomate y aderezo de limón y cilantro.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
    cookTime: 0,
    prepTime: 15,
    servings: 4,
    difficulty: "EASY" as const,
    tags: [
      "garbanzos",
      "aguacate",
      "vegetariano",
      "fibra",
      "grasas-saludables",
    ],
    allergens: [],
    isActive: true,
    ingredients: [
      {
        name: "Garbanzos cocidos",
        amount: 400,
        unit: "g",
        notes: "Enjuagados y escurridos",
      },
      {
        name: "Aguacate",
        amount: 2,
        unit: "unidades",
        notes: "Cortado en cubos",
      },
      {
        name: "Tomate",
        amount: 2,
        unit: "unidades",
        notes: "Cortado en cubos",
      },
      {
        name: "Cebolla roja",
        amount: 0.5,
        unit: "unidad",
        notes: "Cortada finamente",
      },
      { name: "Pepino", amount: 1, unit: "unidad", notes: "Cortado en cubos" },
      { name: "Cilantro fresco", amount: 30, unit: "g", notes: "Picado" },
      { name: "Limón", amount: 2, unit: "unidades", notes: "Jugo fresco" },
      {
        name: "Aceite de oliva",
        amount: 3,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Comino molido", amount: 1, unit: "cucharadita", notes: "" },
      { name: "Sal", amount: 1, unit: "cucharadita", notes: "" },
      {
        name: "Pimienta negra",
        amount: 0.5,
        unit: "cucharadita",
        notes: "Recién molida",
      },
    ],
    nutrition: {
      calories: 285,
      protein: 12,
      carbs: 28,
      fat: 16,
      fiber: 11,
      sugar: 6,
      sodium: 320,
      cholesterol: 0,
    },
  },
  {
    title: "Pechuga de Pollo a la Plancha con Especias",
    description:
      "Pechuga de pollo marinada con especias mediterráneas y cocida a la plancha hasta dorar.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
    cookTime: 12,
    prepTime: 30,
    servings: 4,
    difficulty: "EASY" as const,
    tags: ["pollo", "proteína", "plancha", "especias", "bajo-carbohidratos"],
    allergens: [],
    isActive: true,
    ingredients: [
      {
        name: "Pechuga de pollo",
        amount: 600,
        unit: "g",
        notes: "Sin hueso, sin piel",
      },
      {
        name: "Aceite de oliva",
        amount: 3,
        unit: "cucharadas",
        notes: "Extra virgen",
      },
      { name: "Ajo", amount: 4, unit: "dientes", notes: "Picado" },
      { name: "Orégano seco", amount: 1, unit: "cucharadita", notes: "" },
      { name: "Tomillo seco", amount: 1, unit: "cucharadita", notes: "" },
      { name: "Romero seco", amount: 0.5, unit: "cucharadita", notes: "" },
      { name: "Pimentón dulce", amount: 1, unit: "cucharadita", notes: "" },
      { name: "Sal marina", amount: 1, unit: "cucharadita", notes: "" },
      {
        name: "Pimienta negra",
        amount: 0.5,
        unit: "cucharadita",
        notes: "Recién molida",
      },
      { name: "Limón", amount: 1, unit: "unidad", notes: "Jugo y ralladura" },
    ],
    nutrition: {
      calories: 195,
      protein: 35,
      carbs: 2,
      fat: 4,
      fiber: 0,
      sugar: 1,
      sodium: 420,
      cholesterol: 95,
    },
  },
  {
    title: "Bowl de Avena con Frutas y Nueces",
    description:
      "Desayuno nutritivo con avena cocida, frutas frescas, nueces y semillas de chía.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500",
    cookTime: 10,
    prepTime: 5,
    servings: 2,
    difficulty: "EASY" as const,
    tags: ["avena", "desayuno", "frutas", "nueces", "fibra"],
    allergens: ["nueces"],
    isActive: true,
    ingredients: [
      { name: "Avena", amount: 100, unit: "g", notes: "Hojuelas de avena" },
      {
        name: "Leche de almendras",
        amount: 300,
        unit: "ml",
        notes: "Sin azúcar",
      },
      {
        name: "Plátano",
        amount: 1,
        unit: "unidad",
        notes: "Cortado en rodajas",
      },
      {
        name: "Fresas",
        amount: 100,
        unit: "g",
        notes: "Cortadas por la mitad",
      },
      {
        name: "Arándanos",
        amount: 50,
        unit: "g",
        notes: "Frescos o congelados",
      },
      { name: "Nueces", amount: 30, unit: "g", notes: "Picadas" },
      { name: "Semillas de chía", amount: 1, unit: "cucharada", notes: "" },
      { name: "Miel", amount: 1, unit: "cucharada", notes: "Opcional" },
      { name: "Canela", amount: 0.5, unit: "cucharadita", notes: "En polvo" },
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 12,
      fiber: 10,
      sugar: 18,
      sodium: 80,
      cholesterol: 0,
    },
  },
];

async function main() {
  console.error("🌱 Iniciando seed de la base de datos...");

  try {
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.error("✅ Conectado a la base de datos");
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    throw error;
  }

  // Crear usuario nutricionista
  const hashedPassword = await bcrypt.hash("password123", 10);

  const nutritionist = await prisma.user.upsert({
    where: { email: "nutritionist@example.com" },
    update: {},
    create: {
      email: "nutritionist@example.com",
      name: "Dr. María González",
      password: hashedPassword,
      role: "PRO",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
      isActive: true,
      phone: "+34 600 123 456",
      address: "Calle Salud 123, Madrid",
      bio: "Nutricionista clínica especializada en deporte y pérdida de peso",
      specialization: "Nutrición Deportiva",
      experience: 8,
      education: "Grado en Nutrición Humana y Dietética",
      certifications:
        "Certificación en Nutrición Deportiva, Especialización en Trastornos Alimentarios",
      website: "https://maria-nutricion.com",
      linkedin: "https://linkedin.com/in/maria-gonzalez-nutricion",
      instagram: "@maria_nutricion",
      consultationFee: 60.0,
      timezone: "Europe/Madrid",
      language: ["español", "inglés"],
    },
  });

  console.log("✅ Usuario nutricionista creado:", nutritionist.name);

  // Crear recetas
  for (const recipeData of recipesData) {
    const { ingredients, nutrition, ...recipeInfo } = recipeData;

    const recipe = await prisma.recipe.create({
      data: {
        name: recipeInfo.title,
        authorId: nutritionist.id,
        ...recipeInfo,
        createdBy: nutritionist.id,
        ingredients: {
          create: ingredients.map((ingredient) => ({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
            notes: ingredient.notes,
          })),
        },
        nutrition: {
          create: {
            calories: nutrition.calories,
            protein: nutrition.protein,
            carbs: nutrition.carbs,
            fat: nutrition.fat,
            fiber: nutrition.fiber,
            sugar: nutrition.sugar,
            sodium: nutrition.sodium,
            cholesterol: nutrition.cholesterol,
          },
        },
      },
    });

    console.log(`✅ Receta creada: ${recipe.title}`);
  }

  // Crear usuario paciente de ejemplo
  const patientUser = await prisma.user.upsert({
    where: { email: "patient@example.com" },
    update: {},
    create: {
      email: "patient@example.com",
      name: "Ana Martínez",
      password: hashedPassword,
      role: "USER",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
      isActive: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      nutritionistId: nutritionist.id,
      status: "ACTIVE",
      lastVisit: new Date(),
      nextVisit: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      notes:
        "Paciente motivada con objetivos de pérdida de peso y mejora de hábitos alimentarios",
    },
  });

  console.log("✅ Paciente creado:", patientUser.name);

  // Crear algunas métricas de ejemplo para el paciente
  const metricsData = [
    {
      type: "WEIGHT" as const,
      value: 68.5,
      unit: "kg",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
      notes: "Peso inicial",
    },
    {
      type: "WEIGHT" as const,
      value: 67.8,
      unit: "kg",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
      notes: "Progreso semanal",
    },
    {
      type: "BMI" as const,
      value: 24.2,
      unit: "kg/m²",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      notes: "Calculado con peso actual",
    },
  ];

  for (const metricData of metricsData) {
    await prisma.progressMetric.create({
      data: {
        ...metricData,
        patientId: patient.id,
        userId: patient.userId,
        recordedBy: nutritionist.id,
      },
    });
  }

  console.log("✅ Métricas de ejemplo creadas");

  console.log("🎉 Seed completado exitosamente!");
  console.log(`📊 Resumen:`);
  console.log(`   - 1 nutricionista creado`);
  console.log(`   - 1 paciente creado`);
  console.log(`   - ${recipesData.length} recetas creadas`);
  console.log(`   - ${metricsData.length} métricas creadas`);
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
