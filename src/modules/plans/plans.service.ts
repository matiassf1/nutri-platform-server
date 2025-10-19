import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import { CreatePlanDto, FindAllPlansDto, UpdatePlanDto } from "./dto";

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: FindAllPlansDto, user: CurrentUserType) {
    const { page = 1, limit = 10, search, status, patientId } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    // If user is not admin, filter by their plans
    if (user.role !== "ADMIN") {
      where.OR = [{ nutritionistId: user.id }, { patientId: user.id }];
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const [plans, total] = await Promise.all([
      this.prismaService.plan.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          nutritionist: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          days: {
            include: {
              meals: {
                include: {
                  recipes: {
                    select: {
                      id: true,
                      title: true,
                      image: true,
                      cookTime: true,
                      prepTime: true,
                      difficulty: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.plan.count({ where }),
    ]);

    return {
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: CurrentUserType) {
    const plan = await this.prismaService.plan.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        nutritionist: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        days: {
          include: {
            meals: {
              include: {
                recipes: {
                  select: {
                    id: true,
                    title: true,
                    image: true,
                    cookTime: true,
                    prepTime: true,
                    difficulty: true,
                    nutrition: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    // Check if user has access to this plan
    if (
      user.role !== "ADMIN" &&
      plan.nutritionistId !== user.id &&
      plan.patientId !== user.id
    ) {
      throw new ForbiddenException("You do not have access to this plan");
    }

    return plan;
  }

  async create(createPlanDto: CreatePlanDto, user: CurrentUserType) {
    const { days, ...planData } = createPlanDto;

    // Verify patient exists and user has access
    if (user.role !== "ADMIN") {
      const patient = await this.prismaService.patient.findFirst({
        where: {
          id: createPlanDto.patientId,
          nutritionistId: user.id,
        },
      });

      if (!patient) {
        throw new ForbiddenException(
          "You can only create plans for your patients"
        );
      }
    }

    const plan = await this.prismaService.plan.create({
      data: {
        ...planData,
        nutritionistId: user.id,
        patientId: createPlanDto.patientId,
        days: {
          create: days.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            isActive: day.isActive ?? true,
            notes: day.notes,
            meals: {
              create: day.meals.map((meal) => ({
                type: meal.type,
                time: meal.time,
                isCompleted: meal.isCompleted ?? false,
                notes: meal.notes,
                recipes: {
                  connect: meal.recipeIds?.map((id) => ({ id })) || [],
                },
              })),
            },
          })),
        },
      },
    });

    this.logger.log(`Plan created: ${plan.id} by user: ${user.id}`);

    return plan;
  }

  async update(
    id: string,
    updatePlanDto: UpdatePlanDto,
    user: CurrentUserType
  ) {
    const existingPlan = await this.prismaService.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException("Plan not found");
    }

    // Check if user has access to update this plan
    if (user.role !== "ADMIN" && existingPlan.nutritionistId !== user.id) {
      throw new ForbiddenException("You can only update your own plans");
    }

    const { days, ...planData } = updatePlanDto;

    const plan = await this.prismaService.plan.update({
      where: { id },
      data: {
        ...planData,
        // Update days if provided
        ...(days && {
          days: {
            deleteMany: {},
            create: days.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              isActive: day.isActive ?? true,
              notes: day.notes,
              meals: {
                create: day.meals.map((meal) => ({
                  type: meal.type,
                  time: meal.time,
                  isCompleted: meal.isCompleted ?? false,
                  notes: meal.notes,
                  recipes: {
                    connect: meal.recipeIds?.map((id) => ({ id })) || [],
                  },
                })),
              },
            })),
          },
        }),
      },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        nutritionist: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        days: {
          include: {
            meals: {
              include: {
                recipes: {
                  select: {
                    id: true,
                    title: true,
                    image: true,
                    cookTime: true,
                    prepTime: true,
                    difficulty: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    this.logger.log(`Plan updated: ${id} by user: ${user.id}`);

    return plan;
  }

  async remove(id: string, user: CurrentUserType) {
    const existingPlan = await this.prismaService.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      throw new NotFoundException("Plan not found");
    }

    // Check if user has access to delete this plan
    if (user.role !== "ADMIN" && existingPlan.nutritionistId !== user.id) {
      throw new ForbiddenException("You can only delete your own plans");
    }

    // Soft delete
    await this.prismaService.plan.update({
      where: { id },
      data: { status: "DRAFT" },
    });

    this.logger.log(`Plan deleted: ${id} by user: ${user.id}`);

    return { message: "Plan deleted successfully" };
  }

  async updateMealStatus(
    planId: string,
    mealId: string,
    isCompleted: boolean,
    user: CurrentUserType
  ) {
    const meal = await this.prismaService.planMeal.findFirst({
      where: {
        id: mealId,
        planDay: {
          planId,
        },
      },
      include: {
        planDay: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!meal) {
      throw new NotFoundException("Meal not found");
    }

    // Check if user has access to this plan
    if (
      user.role !== "ADMIN" &&
      meal.planDay.plan.nutritionistId !== user.id &&
      meal.planDay.plan.patientId !== user.id
    ) {
      throw new ForbiddenException("You do not have access to this plan");
    }

    const updatedMeal = await this.prismaService.planMeal.update({
      where: { id: mealId },
      data: { isCompleted },
    });

    this.logger.log(
      `Meal status updated: ${mealId} - completed: ${isCompleted}`
    );

    return updatedMeal;
  }

  async getUserPlans(user: CurrentUserType) {
    this.logger.log(`[getUserPlans] Starting getUserPlans for user: ${user.id}`);
    this.logger.log(`[getUserPlans] User data: ${JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    })}`);

    // Get user's patient ID directly from the user object
    // The user object already contains patientId from the auth service
    if (!user.patientId) {
      this.logger.warn(`[getUserPlans] User ${user.id} is not a patient (no patientId)`);
      return []; // User is not a patient
    }

    this.logger.log(`[getUserPlans] Looking for plans with patientId: ${user.patientId}`);

    // First, let's check if the patient exists in the database
    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { id: user.patientId },
        select: { id: true, status: true, userId: true }
      });
      
      this.logger.log(`[getUserPlans] Patient lookup result: ${JSON.stringify(patient)}`);
      
      if (!patient) {
        this.logger.warn(`[getUserPlans] Patient ${user.patientId} not found in database`);
        return [];
      }
    } catch (error) {
      this.logger.error(`[getUserPlans] Error checking patient existence:`, error);
    }

    try {
      const plans = await this.prismaService.plan.findMany({
        where: {
          patientId: user.patientId,
        },
        include: {
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          nutritionist: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          days: {
            include: {
              meals: {
                include: {
                  recipes: {
                    include: {
                      nutrition: true,
                    },
                  },
                  selectedRecipe: {
                    include: {
                      nutrition: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.log(`[getUserPlans] Found ${plans.length} plans for patient ${user.patientId}`);
      this.logger.debug(`[getUserPlans] Plans: ${JSON.stringify(plans, null, 2)}`);

      return plans;
    } catch (error) {
      this.logger.error(`[getUserPlans] Error fetching plans for patient ${user.patientId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener información del paciente actual
   */
  async getPatientInfo(user: CurrentUserType) {
    this.logger.log(`[getPatientInfo] Starting getPatientInfo for user: ${user.id}`);
    this.logger.log(`[getPatientInfo] User data: ${JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    })}`);

    if (!user.patientId) {
      this.logger.warn(`[getPatientInfo] User ${user.id} is not a patient (no patientId)`);
      throw new Error('User is not a patient');
    }

    try {
      const patient = await this.prismaService.patient.findUnique({
        where: { id: user.patientId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          plans: {
            include: {
              nutritionist: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
              days: {
                include: {
                  meals: {
                    include: {
                      recipes: {
                        include: {
                          nutrition: true,
                        },
                      },
                      selectedRecipe: {
                        include: {
                          nutrition: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!patient) {
        this.logger.warn(`[getPatientInfo] Patient ${user.patientId} not found in database`);
        throw new Error('Patient not found');
      }

      this.logger.log(`[getPatientInfo] Found patient: ${patient.user.name}`);
      this.logger.log(`[getPatientInfo] Patient has ${patient.plans.length} plans`);

      return {
        id: patient.id,
        status: patient.status,
        user: patient.user,
        plans: patient.plans,
        totalPlans: patient.plans.length,
        activePlans: patient.plans.filter(plan => plan.status === 'ACTIVE').length,
      };
    } catch (error) {
      this.logger.error(`[getPatientInfo] Error fetching patient info for ${user.patientId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener recetas disponibles para el paciente
   */
  async getAvailableRecipes(user: CurrentUserType) {
    this.logger.log(`[getAvailableRecipes] Getting available recipes for user: ${user.id}`);

    try {
      const recipes = await this.prismaService.recipe.findMany({
        where: {
          isActive: true,
        },
        include: {
          nutrition: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear las recetas para asegurar compatibilidad con el frontend
      const mappedRecipes = recipes.map(recipe => ({
        ...recipe,
        title: recipe.title || recipe.name, // Usar title si existe, sino name
        name: recipe.name || recipe.title,  // Usar name si existe, sino title
      }));

      this.logger.log(`[getAvailableRecipes] Found ${mappedRecipes.length} available recipes`);
      return mappedRecipes;
    } catch (error) {
      this.logger.error(`[getAvailableRecipes] Error fetching recipes:`, error);
      throw error;
    }
  }

  /**
   * Seleccionar una receta para una comida específica
   */
  async selectRecipeForMeal(mealId: string, recipeId: string, user: CurrentUserType) {
    this.logger.log(`[selectRecipeForMeal] Selecting recipe ${recipeId} for meal ${mealId}`);

    try {
      // Verificar que la comida pertenece al paciente
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              patientId: user.patientId,
            },
          },
        },
        include: {
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!meal) {
        throw new Error('Meal not found or does not belong to patient');
      }

      // Verificar que la receta existe y está activa
      const recipe = await this.prismaService.recipe.findFirst({
        where: {
          id: recipeId,
          isActive: true,
        },
        include: {
          nutrition: true,
        },
      });

      if (!recipe) {
        throw new Error('Recipe not found or not active');
      }

      // Actualizar la comida con la receta seleccionada
      const updatedMeal = await this.prismaService.planMeal.update({
        where: { id: mealId },
        data: {
          selectedRecipeId: recipeId,
          // Actualizar valores nutricionales basados en la receta
          kcal: Math.round(recipe.nutrition.calories),
          proteinGr: Math.round(recipe.nutrition.protein),
          carbsGr: Math.round(recipe.nutrition.carbs),
          fatGr: Math.round(recipe.nutrition.fat),
        },
        include: {
          recipes: {
            include: {
              nutrition: true,
            },
          },
          selectedRecipe: {
            include: {
              nutrition: true,
            },
          },
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log(`[selectRecipeForMeal] Recipe selected successfully for meal ${mealId}`);
      return updatedMeal;
    } catch (error) {
      this.logger.error(`[selectRecipeForMeal] Error selecting recipe:`, error);
      throw error;
    }
  }

  /**
   * Agregar una comida personalizada
   */
  async addCustomMeal(mealId: string, customMealData: any, user: CurrentUserType) {
    this.logger.log(`[addCustomMeal] Adding custom meal for meal ${mealId}`);

    try {
      // Verificar que la comida pertenece al paciente
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              patientId: user.patientId,
            },
          },
        },
      });

      if (!meal) {
        throw new Error('Meal not found or does not belong to patient');
      }

      // Crear una receta personalizada
      const customRecipe = await this.prismaService.recipe.create({
        data: {
          name: customMealData.name,
          title: customMealData.name, // Mantener ambos para compatibilidad
          description: customMealData.description || '',
          image: '',
          cookTime: 0,
          prepTime: 0,
          servings: 1,
          difficulty: 'EASY',
          tags: ['Personalizada'],
          allergens: [],
          isActive: true,
          authorId: user.id,
          createdBy: user.id, // Mantener ambos para compatibilidad
          nutrition: {
            create: {
              calories: customMealData.calories,
              protein: customMealData.protein,
              carbs: customMealData.carbs,
              fat: customMealData.fat,
              fiber: customMealData.fiber || 0,
              sugar: customMealData.sugar || 0,
              sodium: customMealData.sodium || 0,
              cholesterol: customMealData.cholesterol || 0,
            },
          },
        },
        include: {
          nutrition: true,
        },
      });

      // Actualizar la comida con la receta personalizada
      const updatedMeal = await this.prismaService.planMeal.update({
        where: { id: mealId },
        data: {
          selectedRecipeId: customRecipe.id,
          kcal: Math.round(customMealData.calories),
          proteinGr: Math.round(customMealData.protein),
          carbsGr: Math.round(customMealData.carbs),
          fatGr: Math.round(customMealData.fat),
        },
        include: {
          recipes: {
            include: {
              nutrition: true,
            },
          },
          selectedRecipe: {
            include: {
              nutrition: true,
            },
          },
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log(`[addCustomMeal] Custom meal added successfully for meal ${mealId}`);
      return updatedMeal;
    } catch (error) {
      this.logger.error(`[addCustomMeal] Error adding custom meal:`, error);
      throw error;
    }
  }

  /**
   * Marcar una comida como completada
   */
  async completeMeal(mealId: string, user: CurrentUserType) {
    this.logger.log(`[completeMeal] Completing meal ${mealId}`);

    try {
      // Verificar que la comida pertenece al paciente
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              patientId: user.patientId,
            },
          },
        },
      });

      if (!meal) {
        throw new Error('Meal not found or does not belong to patient');
      }

      // Marcar la comida como completada
      const updatedMeal = await this.prismaService.planMeal.update({
        where: { id: mealId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
        include: {
          recipes: {
            include: {
              nutrition: true,
            },
          },
          selectedRecipe: {
            include: {
              nutrition: true,
            },
          },
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log(`[completeMeal] Meal ${mealId} marked as completed`);
      return updatedMeal;
    } catch (error) {
      this.logger.error(`[completeMeal] Error completing meal:`, error);
      throw error;
    }
  }

  // ===== MÉTODOS PARA PROFESIONALES =====

  /**
   * Asignar una receta a una comida específica (Solo profesionales)
   */
  async assignRecipeToMeal(mealId: string, recipeId: string, user: CurrentUserType) {
    this.logger.log(`[assignRecipeToMeal] Assigning recipe ${recipeId} to meal ${mealId} by professional ${user.id}`);

    try {
      // Verificar que el usuario es un profesional
      if (user.role !== 'PRO' && user.role !== 'ADMIN') {
        throw new ForbiddenException('Only professionals can assign recipes to meals');
      }

      // Verificar que la comida existe y pertenece a un plan del profesional
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              nutritionistId: user.id,
            },
          },
        },
        include: {
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found or does not belong to your plans');
      }

      // Verificar que la receta existe y está activa
      const recipe = await this.prismaService.recipe.findFirst({
        where: {
          id: recipeId,
          isActive: true,
        },
        include: {
          nutrition: true,
        },
      });

      if (!recipe) {
        throw new NotFoundException('Recipe not found or not active');
      }

      // Asignar la receta a la comida
      const updatedMeal = await this.prismaService.planMeal.update({
        where: { id: mealId },
        data: {
          selectedRecipeId: recipeId,
          // Actualizar valores nutricionales basados en la receta
          kcal: Math.round(recipe.nutrition.calories),
          proteinGr: Math.round(recipe.nutrition.protein),
          carbsGr: Math.round(recipe.nutrition.carbs),
          fatGr: Math.round(recipe.nutrition.fat),
        },
        include: {
          recipes: {
            include: {
              nutrition: true,
            },
          },
          selectedRecipe: {
            include: {
              nutrition: true,
            },
          },
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log(`[assignRecipeToMeal] Recipe ${recipeId} assigned to meal ${mealId} successfully`);
      return updatedMeal;
    } catch (error) {
      this.logger.error(`[assignRecipeToMeal] Error assigning recipe:`, error);
      throw error;
    }
  }

  /**
   * Remover receta asignada de una comida (Solo profesionales)
   */
  async removeRecipeFromMeal(mealId: string, user: CurrentUserType) {
    this.logger.log(`[removeRecipeFromMeal] Removing recipe from meal ${mealId} by professional ${user.id}`);

    try {
      // Verificar que el usuario es un profesional
      if (user.role !== 'PRO' && user.role !== 'ADMIN') {
        throw new ForbiddenException('Only professionals can remove recipes from meals');
      }

      // Verificar que la comida existe y pertenece a un plan del profesional
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              nutritionistId: user.id,
            },
          },
        },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found or does not belong to your plans');
      }

      // Remover la receta asignada
      const updatedMeal = await this.prismaService.planMeal.update({
        where: { id: mealId },
        data: {
          selectedRecipeId: null,
          // Resetear valores nutricionales
          kcal: null,
          proteinGr: null,
          carbsGr: null,
          fatGr: null,
        },
        include: {
          recipes: {
            include: {
              nutrition: true,
            },
          },
          selectedRecipe: {
            include: {
              nutrition: true,
            },
          },
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      this.logger.log(`[removeRecipeFromMeal] Recipe removed from meal ${mealId} successfully`);
      return updatedMeal;
    } catch (error) {
      this.logger.error(`[removeRecipeFromMeal] Error removing recipe:`, error);
      throw error;
    }
  }

  /**
   * Obtener recetas disponibles para una comida específica (Solo profesionales)
   */
  async getAvailableRecipesForMeal(
    mealId: string, 
    query: { search?: string; tags?: string[]; difficulty?: string }, 
    user: CurrentUserType
  ) {
    this.logger.log(`[getAvailableRecipesForMeal] Getting available recipes for meal ${mealId} by professional ${user.id}`);

    try {
      // Verificar que el usuario es un profesional
      if (user.role !== 'PRO' && user.role !== 'ADMIN') {
        throw new ForbiddenException('Only professionals can view available recipes for meals');
      }

      // Verificar que la comida existe y pertenece a un plan del profesional
      const meal = await this.prismaService.planMeal.findFirst({
        where: {
          id: mealId,
          planDay: {
            plan: {
              nutritionistId: user.id,
            },
          },
        },
        include: {
          planDay: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (!meal) {
        throw new NotFoundException('Meal not found or does not belong to your plans');
      }

      // Construir filtros para las recetas
      const where: any = {
        isActive: true,
      };

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      if (query.difficulty) {
        where.difficulty = query.difficulty;
      }

      if (query.tags && query.tags.length > 0) {
        where.tags = {
          hasSome: query.tags,
        };
      }

      // Obtener recetas disponibles
      const recipes = await this.prismaService.recipe.findMany({
        where,
        include: {
          nutrition: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Mapear las recetas para asegurar compatibilidad con el frontend
      const mappedRecipes = recipes.map(recipe => ({
        ...recipe,
        title: recipe.title || recipe.name,
        name: recipe.name || recipe.title,
      }));

      this.logger.log(`[getAvailableRecipesForMeal] Found ${mappedRecipes.length} available recipes for meal ${mealId}`);
      return mappedRecipes;
    } catch (error) {
      this.logger.error(`[getAvailableRecipesForMeal] Error getting available recipes:`, error);
      throw error;
    }
  }
}
