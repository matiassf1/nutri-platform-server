import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ============================================
// DATOS DE RECETAS
// ============================================
const recipesData = [
  {
    title: "Ensalada César Saludable",
    description: "Una versión más saludable de la ensalada César tradicional.",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
    cookTime: 15, prepTime: 20, servings: 4,
    difficulty: "EASY" as const,
    tags: ["ensalada", "vegetariano", "bajo-carbohidratos"],
    allergens: ["gluten", "lácteos"],
    ingredients: [
      { name: "Lechuga romana", amount: 1, unit: "cabeza", notes: "Lavada" },
      { name: "Pechuga de pollo", amount: 300, unit: "g", notes: "Cocida" },
      { name: "Parmesano", amount: 50, unit: "g", notes: "Rallado" },
    ],
    nutrition: { calories: 320, protein: 28, carbs: 12, fat: 18, fiber: 4, sugar: 3, sodium: 680, cholesterol: 65 },
  },
  {
    title: "Salmón al Horno con Vegetales",
    description: "Salmón fresco con vegetales de temporada.",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500",
    cookTime: 25, prepTime: 15, servings: 4,
    difficulty: "EASY" as const,
    tags: ["pescado", "omega-3", "proteína"],
    allergens: ["pescado"],
    ingredients: [
      { name: "Filete de salmón", amount: 600, unit: "g", notes: "Sin piel" },
      { name: "Brócoli", amount: 300, unit: "g", notes: "En floretes" },
      { name: "Zanahorias", amount: 200, unit: "g", notes: "En bastones" },
    ],
    nutrition: { calories: 285, protein: 35, carbs: 8, fat: 12, fiber: 3, sugar: 4, sodium: 420, cholesterol: 85 },
  },
  {
    title: "Quinoa con Pollo y Vegetales",
    description: "Bowl nutritivo de quinoa con pollo.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
    cookTime: 20, prepTime: 25, servings: 4,
    difficulty: "MEDIUM" as const,
    tags: ["quinoa", "pollo", "proteína-completa"],
    allergens: ["sésamo"],
    ingredients: [
      { name: "Quinoa", amount: 200, unit: "g", notes: "Lavada" },
      { name: "Pechuga de pollo", amount: 400, unit: "g", notes: "En cubos" },
      { name: "Pimientos", amount: 2, unit: "unidades", notes: "Cortados" },
    ],
    nutrition: { calories: 425, protein: 32, carbs: 45, fat: 14, fiber: 6, sugar: 8, sodium: 380, cholesterol: 70 },
  },
  {
    title: "Smoothie Verde Energético",
    description: "Smoothie nutritivo con espinacas y frutas.",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500",
    cookTime: 5, prepTime: 10, servings: 2,
    difficulty: "EASY" as const,
    tags: ["smoothie", "verde", "desayuno"],
    allergens: [],
    ingredients: [
      { name: "Espinacas", amount: 60, unit: "g", notes: "Frescas" },
      { name: "Plátano", amount: 1, unit: "unidad", notes: "Congelado" },
      { name: "Mango", amount: 100, unit: "g", notes: "Congelado" },
    ],
    nutrition: { calories: 280, protein: 25, carbs: 35, fat: 6, fiber: 8, sugar: 28, sodium: 120, cholesterol: 0 },
  },
  {
    title: "Pasta Integral con Atún",
    description: "Pasta integral con atún fresco y tomates.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500",
    cookTime: 15, prepTime: 10, servings: 4,
    difficulty: "EASY" as const,
    tags: ["pasta", "atún", "italiana"],
    allergens: ["gluten", "pescado"],
    ingredients: [
      { name: "Pasta integral", amount: 400, unit: "g", notes: "Spaghetti" },
      { name: "Atún fresco", amount: 300, unit: "g", notes: "En cubos" },
      { name: "Tomates cherry", amount: 300, unit: "g", notes: "Cortados" },
    ],
    nutrition: { calories: 485, protein: 28, carbs: 65, fat: 12, fiber: 8, sugar: 6, sodium: 520, cholesterol: 45 },
  },
  {
    title: "Bowl de Avena con Frutas",
    description: "Desayuno nutritivo con avena y frutas frescas.",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500",
    cookTime: 10, prepTime: 5, servings: 2,
    difficulty: "EASY" as const,
    tags: ["avena", "desayuno", "frutas"],
    allergens: ["nueces"],
    ingredients: [
      { name: "Avena", amount: 100, unit: "g", notes: "Hojuelas" },
      { name: "Plátano", amount: 1, unit: "unidad", notes: "En rodajas" },
      { name: "Fresas", amount: 100, unit: "g", notes: "Cortadas" },
    ],
    nutrition: { calories: 320, protein: 12, carbs: 45, fat: 12, fiber: 10, sugar: 18, sodium: 80, cholesterol: 0 },
  },
  {
    title: "Ensalada de Garbanzos",
    description: "Ensalada nutritiva con garbanzos y aguacate.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
    cookTime: 0, prepTime: 15, servings: 4,
    difficulty: "EASY" as const,
    tags: ["garbanzos", "vegetariano", "fibra"],
    allergens: [],
    ingredients: [
      { name: "Garbanzos cocidos", amount: 400, unit: "g", notes: "Escurridos" },
      { name: "Aguacate", amount: 2, unit: "unidades", notes: "En cubos" },
      { name: "Tomate", amount: 2, unit: "unidades", notes: "En cubos" },
    ],
    nutrition: { calories: 285, protein: 12, carbs: 28, fat: 16, fiber: 11, sugar: 6, sodium: 320, cholesterol: 0 },
  },
  {
    title: "Pollo a la Plancha con Especias",
    description: "Pechuga de pollo marinada con especias.",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500",
    cookTime: 12, prepTime: 30, servings: 4,
    difficulty: "EASY" as const,
    tags: ["pollo", "proteína", "bajo-carbohidratos"],
    allergens: [],
    ingredients: [
      { name: "Pechuga de pollo", amount: 600, unit: "g", notes: "Sin hueso" },
      { name: "Aceite de oliva", amount: 3, unit: "cucharadas", notes: "" },
      { name: "Especias mixtas", amount: 2, unit: "cucharaditas", notes: "" },
    ],
    nutrition: { calories: 195, protein: 35, carbs: 2, fat: 4, fiber: 0, sugar: 1, sodium: 420, cholesterol: 95 },
  },
];

// ============================================
// DATOS DE PACIENTES
// ============================================
const patientsData = [
  { name: "Ana Martínez", email: "ana.martinez@example.com", status: "ACTIVE", notes: "Objetivo: pérdida de peso" },
  { name: "Carlos López", email: "carlos.lopez@example.com", status: "ACTIVE", notes: "Objetivo: ganancia muscular" },
  { name: "María García", email: "maria.garcia@example.com", status: "ACTIVE", notes: "Control de diabetes tipo 2" },
  { name: "Pedro Sánchez", email: "pedro.sanchez@example.com", status: "ACTIVE", notes: "Dieta sin gluten" },
  { name: "Laura Fernández", email: "laura.fernandez@example.com", status: "ACTIVE", notes: "Embarazo - 2do trimestre" },
  { name: "Diego Rodríguez", email: "diego.rodriguez@example.com", status: "INACTIVE", notes: "Tratamiento pausado" },
  { name: "Sofía Ruiz", email: "sofia.ruiz@example.com", status: "ACTIVE", notes: "Nutrición deportiva - runner" },
  { name: "Andrés Torres", email: "andres.torres@example.com", status: "PENDING", notes: "Primera consulta pendiente" },
  { name: "Valentina Castro", email: "valentina.castro@example.com", status: "ACTIVE", notes: "Vegetariana - suplementación" },
  { name: "Nicolás Moreno", email: "nicolas.moreno@example.com", status: "ACTIVE", notes: "Control de colesterol" },
];

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  console.log("🌱 Iniciando seed completo de la base de datos...\n");

  try {
    await prisma.$connect();
    console.log("✅ Conectado a la base de datos\n");
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    throw error;
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  // ============================================
  // 1. CREAR NUTRICIONISTA PRINCIPAL
  // ============================================
  console.log("👨‍⚕️ Creando nutricionista principal...");
  
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
      certifications: "Certificación en Nutrición Deportiva",
      consultationFee: 60.0,
      timezone: "Europe/Madrid",
      language: ["español", "inglés"],
    },
  });
  console.log(`   ✅ Nutricionista: ${nutritionist.name} (${nutritionist.email})`);

  // ============================================
  // 2. CREAR RECETAS
  // ============================================
  console.log("\n🍽️ Creando recetas...");
  
  const createdRecipes = [];
  for (const recipeData of recipesData) {
    const { ingredients, nutrition, ...recipeInfo } = recipeData;
    
    // Verificar si ya existe
    const existingRecipe = await prisma.recipe.findFirst({
      where: { title: recipeInfo.title, authorId: nutritionist.id },
    });

    if (!existingRecipe) {
      const recipe = await prisma.recipe.create({
        data: {
          name: recipeInfo.title,
          authorId: nutritionist.id,
          createdBy: nutritionist.id,
          ...recipeInfo,
          ingredients: {
            create: ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              notes: ing.notes,
            })),
          },
          nutrition: {
            create: nutrition,
          },
        },
      });
      createdRecipes.push(recipe);
      console.log(`   ✅ Receta: ${recipe.title}`);
    } else {
      createdRecipes.push(existingRecipe);
      console.log(`   ⏭️ Receta ya existe: ${existingRecipe.title}`);
    }
  }

  // ============================================
  // 3. CREAR 10 PACIENTES
  // ============================================
  console.log("\n👥 Creando 10 pacientes de prueba...");
  
  const createdPatients = [];
  for (let i = 0; i < patientsData.length; i++) {
    const patientData = patientsData[i];
    
    // Crear usuario para el paciente
    const patientUser = await prisma.user.upsert({
      where: { email: patientData.email },
      update: {},
      create: {
        email: patientData.email,
        name: patientData.name,
        password: hashedPassword,
        role: "USER",
        avatar: `https://i.pravatar.cc/150?u=${patientData.email}`,
        isActive: true,
      },
    });

    // Crear registro de paciente
    const patient = await prisma.patient.upsert({
      where: { userId: patientUser.id },
      update: {},
      create: {
        userId: patientUser.id,
        nutritionistId: nutritionist.id,
        status: patientData.status as "ACTIVE" | "INACTIVE" | "PENDING",
        lastVisit: patientData.status === "PENDING" ? null : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextVisit: patientData.status !== "INACTIVE" ? new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000) : null,
        notes: patientData.notes,
      },
    });

    createdPatients.push({ user: patientUser, patient });
    console.log(`   ✅ Paciente ${i + 1}/10: ${patientUser.name} (${patientData.status})`);
  }

  // ============================================
  // 4. CREAR MÉTRICAS PARA PACIENTES ACTIVOS
  // ============================================
  console.log("\n📊 Creando métricas de ejemplo...");
  
  let metricsCount = 0;
  for (const { user, patient } of createdPatients) {
    if (patient.status !== "ACTIVE") continue;

    // Peso inicial y actual
    const initialWeight = 60 + Math.random() * 40; // 60-100 kg
    const currentWeight = initialWeight - Math.random() * 5; // Pequeña pérdida
    
    const metricsToCreate = [
      { type: "WEIGHT" as const, value: parseFloat(initialWeight.toFixed(1)), unit: "kg", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), notes: "Peso inicial" },
      { type: "WEIGHT" as const, value: parseFloat((initialWeight - 1).toFixed(1)), unit: "kg", date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), notes: "Semana 2" },
      { type: "WEIGHT" as const, value: parseFloat(currentWeight.toFixed(1)), unit: "kg", date: new Date(), notes: "Peso actual" },
      { type: "BMI" as const, value: parseFloat((currentWeight / 2.89).toFixed(1)), unit: "kg/m²", date: new Date(), notes: "IMC actual" },
      { type: "BODY_FAT" as const, value: parseFloat((15 + Math.random() * 20).toFixed(1)), unit: "%", date: new Date(), notes: "% grasa corporal" },
    ];

    for (const metricData of metricsToCreate) {
      await prisma.progressMetric.create({
        data: {
          ...metricData,
          patientId: patient.id,
          userId: user.id,
          recordedBy: nutritionist.id,
        },
      });
      metricsCount++;
    }
  }
  console.log(`   ✅ ${metricsCount} métricas creadas`);

  // ============================================
  // 5. CREAR PLANES PARA ALGUNOS PACIENTES
  // ============================================
  console.log("\n📋 Creando planes de ejemplo...");
  
  const planTemplates = [
    { name: "Plan Pérdida de Peso", description: "Plan de 4 semanas para pérdida de peso gradual", goals: ["WEIGHT_LOSS", "HEALTH_IMPROVEMENT"] },
    { name: "Plan Ganancia Muscular", description: "Plan alto en proteínas para desarrollo muscular", goals: ["MUSCLE_GAIN", "ENERGY_BOOST"] },
    { name: "Plan Control Diabetes", description: "Plan bajo en azúcares para control glucémico", goals: ["HEALTH_IMPROVEMENT", "BLOOD_SUGAR_CONTROL"] },
    { name: "Plan Vegetariano Completo", description: "Plan vegetariano equilibrado con suplementación", goals: ["HEALTH_IMPROVEMENT", "BALANCED_DIET"] },
  ];

  let plansCount = 0;
  
  // Crear plantillas sin paciente asignado
  for (const template of planTemplates) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: template.name, nutritionistId: nutritionist.id, patientId: null },
    });

    if (!existingPlan) {
      const plan = await prisma.plan.create({
        data: {
          name: template.name,
          description: template.description,
          nutritionistId: nutritionist.id,
          patientId: null, // Plantilla sin asignar
          status: "DRAFT",
          goals: template.goals,
          kcalPerDay: 1800 + Math.floor(Math.random() * 600),
          proteinGr: 80 + Math.floor(Math.random() * 60),
          fatGr: 50 + Math.floor(Math.random() * 30),
          carbsGr: 200 + Math.floor(Math.random() * 100),
          days: {
            create: Array.from({ length: 7 }, (_, dayIndex) => ({
              dayOfWeek: dayIndex,
              isActive: true,
              meals: {
                create: [
                  { type: "BREAKFAST" as const, time: "08:00", notes: "Desayuno equilibrado" },
                  { type: "SNACK" as const, time: "11:00", notes: "Colación media mañana" },
                  { type: "LUNCH" as const, time: "13:30", notes: "Almuerzo principal" },
                  { type: "SNACK" as const, time: "17:00", notes: "Merienda" },
                  { type: "DINNER" as const, time: "20:30", notes: "Cena ligera" },
                ],
              },
            })),
          },
        },
      });
      plansCount++;
      console.log(`   ✅ Plantilla: ${plan.name}`);
    }
  }

  // Crear planes asignados a pacientes activos
  for (let i = 0; i < 3; i++) {
    const { user, patient } = createdPatients[i];
    if (patient.status !== "ACTIVE") continue;

    const plan = await prisma.plan.create({
      data: {
        name: `Plan Personalizado - ${user.name}`,
        description: `Plan nutricional personalizado para ${user.name}`,
        nutritionistId: nutritionist.id,
        patientId: patient.id,
        status: "ACTIVE",
        goals: ["HEALTH_IMPROVEMENT", "WEIGHT_LOSS"],
        kcalPerDay: 1800 + Math.floor(Math.random() * 400),
        proteinGr: 90,
        fatGr: 60,
        carbsGr: 220,
        days: {
          create: Array.from({ length: 7 }, (_, dayIndex) => ({
            dayOfWeek: dayIndex,
            isActive: true,
            meals: {
              create: [
                { type: "BREAKFAST" as const, time: "08:00" },
                { type: "LUNCH" as const, time: "13:00" },
                { type: "DINNER" as const, time: "20:00" },
              ],
            },
          })),
        },
      },
    });
    plansCount++;
    console.log(`   ✅ Plan asignado: ${plan.name}`);
  }

  console.log(`   📋 Total: ${plansCount} planes creados`);

  // ============================================
  // 6. CREAR CITAS
  // ============================================
  console.log("\n📅 Creando citas de ejemplo...");
  
  let appointmentsCount = 0;
  const appointmentTypes = ["INITIAL_CONSULTATION", "FOLLOW_UP", "REVIEW"] as const;
  const times = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];
  
  for (const { patient } of createdPatients) {
    if (patient.status === "PENDING") continue;

    // Cita pasada (completada)
    await prisma.appointment.create({
      data: {
        patient: { connect: { id: patient.id } },
        nutritionist: { connect: { id: nutritionist.id } },
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        time: times[Math.floor(Math.random() * times.length)],
        duration: 45,
        type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
        status: "COMPLETED",
        notes: "Consulta realizada exitosamente",
      },
    });
    appointmentsCount++;

    // Cita futura (programada)
    if (patient.status === "ACTIVE") {
      await prisma.appointment.create({
        data: {
          patient: { connect: { id: patient.id } },
          nutritionist: { connect: { id: nutritionist.id } },
          date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
          time: times[Math.floor(Math.random() * times.length)],
          duration: 30,
          type: "FOLLOW_UP",
          status: "SCHEDULED",
          notes: "Seguimiento programado",
        },
      });
      appointmentsCount++;
    }
  }
  console.log(`   ✅ ${appointmentsCount} citas creadas`);

  // ============================================
  // RESUMEN FINAL
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEED COMPLETADO EXITOSAMENTE!");
  console.log("=".repeat(50));
  console.log("\n📊 Resumen:");
  console.log(`   👨‍⚕️ 1 nutricionista`);
  console.log(`   👥 ${createdPatients.length} pacientes`);
  console.log(`   🍽️ ${createdRecipes.length} recetas`);
  console.log(`   📋 ${plansCount} planes`);
  console.log(`   📊 ${metricsCount} métricas`);
  console.log(`   📅 ${appointmentsCount} citas`);
  console.log("\n🔑 Credenciales de prueba:");
  console.log("   Nutricionista: nutritionist@example.com / password123");
  console.log("   Pacientes: [email del paciente] / password123");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
