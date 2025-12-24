import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";
import { CreateRecipeDto, FindAllRecipesDto, UpdateRecipeDto } from "./dto";

@Injectable()
export class RecipesService {
  private readonly logger = new Logger(RecipesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(query: FindAllRecipesDto) {
    const {
      page = 1,
      limit = 10,
      search,
      difficulty,
      tags,
      allergens,
      isActive = true,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      isActive,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (allergens && allergens.length > 0) {
      where.allergens = {
        hasSome: allergens,
      };
    }

    const [recipes, total] = await Promise.all([
      this.prismaService.recipe.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          ingredients: true,
          nutrition: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      this.prismaService.recipe.count({ where }),
    ]);

    return {
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const recipe = await this.prismaService.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        ingredients: true,
        nutrition: true,
      },
    });

    if (!recipe) {
      throw new NotFoundException("Recipe not found");
    }

    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto, user: CurrentUserType) {
    const { ingredients, nutrition, name, ...recipeData } = createRecipeDto;

    const recipe = await this.prismaService.recipe.create({
      data: {
        ...recipeData,
        // Use name if provided, otherwise default to title
        name: name || recipeData.title,
        // Set both authorId (for relation) and createdBy (for compatibility)
        authorId: user.id,
        createdBy: user.id,
        ingredients: {
          create: ingredients,
        },
        nutrition: nutrition
          ? {
              create: nutrition,
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        ingredients: true,
        nutrition: true,
      },
    });

    this.logger.log(`Recipe created: ${recipe.id} by user: ${user.id}`);

    return recipe;
  }

  async update(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    user: CurrentUserType
  ) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundException("Recipe not found");
    }

    // Check if user owns the recipe or is admin
    if (existingRecipe.createdBy !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenException("You can only update your own recipes");
    }

    const { ingredients, nutrition, ...recipeData } = updateRecipeDto;

    const recipe = await this.prismaService.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        // Update ingredients if provided
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients,
          },
        }),
        // Update nutrition if provided
        ...(nutrition && {
          nutrition: {
            upsert: {
              create: nutrition,
              update: nutrition,
            },
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        ingredients: true,
        nutrition: true,
      },
    });

    this.logger.log(`Recipe updated: ${id} by user: ${user.id}`);

    return recipe;
  }

  async remove(id: string, user: CurrentUserType) {
    const existingRecipe = await this.prismaService.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundException("Recipe not found");
    }

    // Check if user owns the recipe or is admin
    if (existingRecipe.createdBy !== user.id && user.role !== "ADMIN") {
      throw new ForbiddenException("You can only delete your own recipes");
    }

    // Soft delete
    await this.prismaService.recipe.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Recipe deleted: ${id} by user: ${user.id}`);

    return { message: "Recipe deleted successfully" };
  }

  async getRecipeStats(userId: string) {
    const [total, published, draft, totalIngredients] = await Promise.all([
      this.prismaService.recipe.count({
        where: { createdBy: userId },
      }),
      this.prismaService.recipe.count({
        where: { createdBy: userId, isActive: true },
      }),
      this.prismaService.recipe.count({
        where: { createdBy: userId, isActive: false },
      }),
      this.prismaService.recipeIngredient.count({
        where: {
          recipe: {
            createdBy: userId,
          },
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      totalIngredients,
      averageRating: 0, // TODO: Implement when ratings are added
    };
  }

  async getItemKeys(name?: string) {
    const where: any = {
      isActive: true,
    };

    if (name) {
      where.title = {
        contains: name,
        mode: "insensitive",
      };
    }

    const recipes = await this.prismaService.recipe.findMany({
      where,
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
      take: 50, // Limit to 50 items for performance
    });

    return recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.title,
    }));
  }
}
