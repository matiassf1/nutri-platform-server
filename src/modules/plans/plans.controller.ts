import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { ResponseService } from "../../common/services/response.service";
import { CreatePlanDto, FindAllPlansDto, UpdatePlanDto } from "./dto";
import { PlansService } from "./plans.service";

@ApiTags("Plans")
@Controller("plans")
@ApiBearerAuth("JWT-auth")
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly responseService: ResponseService
  ) {}

  @Get("my-plans")
  @ApiOperation({ summary: "Get current user's plans" })
  @ApiResponse({
    status: 200,
    description: "User plans retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "User plans retrieved successfully" },
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              status: { type: "string" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" },
            },
          },
        },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getMyPlans(@CurrentUser() user: CurrentUserType) {
    console.log(`[PlansController.getMyPlans] Received request from user:`, {
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    });
    
    try {
      const plans = await this.plansService.getUserPlans(user);
      console.log(`[PlansController.getMyPlans] Service returned ${plans.length} plans`);
      return this.responseService.success(plans, "User plans retrieved successfully");
    } catch (error) {
      console.error(`[PlansController.getMyPlans] Error:`, error);
      throw error;
    }
  }

  @Get("patient-info")
  @ApiOperation({ summary: "Get current user's patient information" })
  @ApiResponse({
    status: 200,
    description: "Patient information retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Patient not found" })
  async getPatientInfo(@CurrentUser() user: CurrentUserType) {
    console.log(`[PlansController.getPatientInfo] Received request from user:`, {
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    });
    
    try {
      const patientInfo = await this.plansService.getPatientInfo(user);
      console.log(`[PlansController.getPatientInfo] Service returned patient info:`, patientInfo);
      return this.responseService.success(patientInfo, "Patient information retrieved successfully");
    } catch (error) {
      console.error(`[PlansController.getPatientInfo] Error:`, error);
      throw error;
    }
  }

  @Get("available-recipes")
  @ApiOperation({ summary: "Get available recipes for patient" })
  @ApiResponse({
    status: 200,
    description: "Available recipes retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAvailableRecipes(@CurrentUser() user: CurrentUserType) {
    console.log(`[PlansController.getAvailableRecipes] Received request from user:`, {
      id: user.id,
      email: user.email,
      role: user.role,
      patientId: user.patientId
    });
    
    try {
      const recipes = await this.plansService.getAvailableRecipes(user);
      console.log(`[PlansController.getAvailableRecipes] Service returned ${recipes.length} recipes`);
      return this.responseService.success(recipes, "Available recipes retrieved successfully");
    } catch (error) {
      console.error(`[PlansController.getAvailableRecipes] Error:`, error);
      throw error;
    }
  }

  @Post("meals/:mealId/select-recipe")
  @ApiOperation({ summary: "Select a recipe for a specific meal" })
  @ApiResponse({
    status: 200,
    description: "Recipe selected successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Meal or recipe not found" })
  async selectRecipeForMeal(
    @Param("mealId") mealId: string,
    @Body() body: { recipeId: string },
    @CurrentUser() user: CurrentUserType
  ) {
    console.log(`[PlansController.selectRecipeForMeal] Received request:`, {
      mealId,
      recipeId: body.recipeId,
      userId: user.id
    });
    
    try {
      const result = await this.plansService.selectRecipeForMeal(mealId, body.recipeId, user);
      console.log(`[PlansController.selectRecipeForMeal] Recipe selected successfully`);
      return this.responseService.success(result, "Recipe selected successfully");
    } catch (error) {
      console.error(`[PlansController.selectRecipeForMeal] Error:`, error);
      throw error;
    }
  }

  @Post("meals/:mealId/custom-meal")
  @ApiOperation({ summary: "Add custom meal for tracking" })
  @ApiResponse({
    status: 200,
    description: "Custom meal added successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Meal not found" })
  async addCustomMeal(
    @Param("mealId") mealId: string,
    @Body() body: {
      name: string;
      description?: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      cholesterol?: number;
    },
    @CurrentUser() user: CurrentUserType
  ) {
    console.log(`[PlansController.addCustomMeal] Received request:`, {
      mealId,
      customMeal: body,
      userId: user.id
    });
    
    try {
      const result = await this.plansService.addCustomMeal(mealId, body, user);
      console.log(`[PlansController.addCustomMeal] Custom meal added successfully`);
      return this.responseService.success(result, "Custom meal added successfully");
    } catch (error) {
      console.error(`[PlansController.addCustomMeal] Error:`, error);
      throw error;
    }
  }

  @Post("meals/:mealId/complete")
  @ApiOperation({ summary: "Mark meal as completed" })
  @ApiResponse({
    status: 200,
    description: "Meal marked as completed",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Meal not found" })
  async completeMeal(
    @Param("mealId") mealId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    console.log(`[PlansController.completeMeal] Received request:`, {
      mealId,
      userId: user.id
    });
    
    try {
      const result = await this.plansService.completeMeal(mealId, user);
      console.log(`[PlansController.completeMeal] Meal completed successfully`);
      return this.responseService.success(result, "Meal completed successfully");
    } catch (error) {
      console.error(`[PlansController.completeMeal] Error:`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all nutrition plans with filters" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Search term",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"],
  })
  @ApiQuery({
    name: "patientId",
    required: false,
    type: String,
    description: "Filter by patient ID",
  })
  @ApiResponse({
    status: 200,
    description: "Plans retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(
    @Query() query: FindAllPlansDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.plansService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Plans retrieved successfully"
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get plan by ID" })
  @ApiParam({ name: "id", description: "Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Plan retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Access denied" })
  @ApiResponse({ status: 404, description: "Plan not found" })
  async findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const plan = await this.plansService.findOne(id, user);
    return this.responseService.success(plan, "Plan retrieved successfully");
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new nutrition plan" })
  @ApiResponse({
    status: 201,
    description: "Plan created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only create plans for your patients",
  })
  async create(
    @Body() createPlanDto: CreatePlanDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const plan = await this.plansService.create(createPlanDto, user);
    return this.responseService.created(plan, "Plan created successfully");
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update nutrition plan" })
  @ApiParam({ name: "id", description: "Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Plan updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only update your own plans",
  })
  @ApiResponse({ status: 404, description: "Plan not found" })
  async update(
    @Param("id") id: string,
    @Body() updatePlanDto: UpdatePlanDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const plan = await this.plansService.update(id, updatePlanDto, user);
    return this.responseService.updated(plan, "Plan updated successfully");
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete nutrition plan" })
  @ApiParam({ name: "id", description: "Plan ID" })
  @ApiResponse({
    status: 200,
    description: "Plan deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only delete your own plans",
  })
  @ApiResponse({ status: 404, description: "Plan not found" })
  async remove(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const result = await this.plansService.remove(id, user);
    return this.responseService.success(result, "Plan deleted successfully");
  }

  @Patch(":planId/meals/:mealId/status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update meal completion status" })
  @ApiParam({ name: "planId", description: "Plan ID" })
  @ApiParam({ name: "mealId", description: "Meal ID" })
  @ApiResponse({
    status: 200,
    description: "Meal status updated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Access denied" })
  @ApiResponse({ status: 404, description: "Meal not found" })
  async updateMealStatus(
    @Param("planId") planId: string,
    @Param("mealId") mealId: string,
    @Body() body: { isCompleted: boolean },
    @CurrentUser() user: CurrentUserType
  ) {
    const meal = await this.plansService.updateMealStatus(
      planId,
      mealId,
      body.isCompleted,
      user
    );
    return this.responseService.updated(
      meal,
      "Meal status updated successfully"
    );
  }

  // ===== ENDPOINTS PARA PROFESIONALES =====

  @Post("meals/:mealId/assign-recipe")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Assign a recipe to a specific meal (Professional only)" })
  @ApiParam({ name: "mealId", description: "Meal ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe assigned to meal successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Professional access required" })
  @ApiResponse({ status: 404, description: "Meal or recipe not found" })
  async assignRecipeToMeal(
    @Param("mealId") mealId: string,
    @Body() body: { recipeId: string },
    @CurrentUser() user: CurrentUserType
  ) {
    const meal = await this.plansService.assignRecipeToMeal(mealId, body.recipeId, user);
    return this.responseService.updated(meal, "Recipe assigned to meal successfully");
  }

  @Delete("meals/:mealId/recipe")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove assigned recipe from meal (Professional only)" })
  @ApiParam({ name: "mealId", description: "Meal ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe removed from meal successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Professional access required" })
  @ApiResponse({ status: 404, description: "Meal not found" })
  async removeRecipeFromMeal(
    @Param("mealId") mealId: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const meal = await this.plansService.removeRecipeFromMeal(mealId, user);
    return this.responseService.updated(meal, "Recipe removed from meal successfully");
  }

  @Get("meals/:mealId/available-recipes")
  @ApiOperation({ summary: "Get available recipes for a specific meal (Professional only)" })
  @ApiParam({ name: "mealId", description: "Meal ID" })
  @ApiQuery({ name: "search", required: false, type: String, description: "Search term" })
  @ApiQuery({ name: "tags", required: false, type: [String], description: "Filter by tags" })
  @ApiQuery({ name: "difficulty", required: false, enum: ["EASY", "MEDIUM", "HARD"], description: "Filter by difficulty" })
  @ApiResponse({
    status: 200,
    description: "Available recipes retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Professional access required" })
  @ApiResponse({ status: 404, description: "Meal not found" })
  async getAvailableRecipesForMeal(
    @Param("mealId") mealId: string,
    @Query() query: { search?: string; tags?: string[]; difficulty?: string },
    @CurrentUser() user: CurrentUserType
  ) {
    const recipes = await this.plansService.getAvailableRecipesForMeal(mealId, query, user);
    return this.responseService.success(recipes, "Available recipes retrieved successfully");
  }

}
