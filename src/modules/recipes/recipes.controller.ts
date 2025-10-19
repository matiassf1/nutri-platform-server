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
import { CreateRecipeDto, FindAllRecipesDto, UpdateRecipeDto } from "./dto";
import { RecipesService } from "./recipes.service";

@ApiTags("Recipes")
@Controller("recipes")
@ApiBearerAuth("JWT-auth")
export class RecipesController {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly responseService: ResponseService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all recipes with filters" })
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
    name: "difficulty",
    required: false,
    enum: ["EASY", "MEDIUM", "HARD"],
  })
  @ApiQuery({
    name: "tags",
    required: false,
    type: [String],
    description: "Filter by tags",
  })
  @ApiQuery({
    name: "allergens",
    required: false,
    type: [String],
    description: "Filter by allergens",
  })
  @ApiResponse({
    status: 200,
    description: "Recipes retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(@Query() query: FindAllRecipesDto) {
    const result = await this.recipesService.findAll(query);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Recipes retrieved successfully"
    );
  }

  @Get("stats")
  @ApiOperation({ summary: "Get recipe statistics for current user" })
  @ApiResponse({
    status: 200,
    description: "Recipe statistics retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getStats(@CurrentUser() user: CurrentUserType) {
    const stats = await this.recipesService.getRecipeStats(user.id);
    return this.responseService.success(
      stats,
      "Recipe statistics retrieved successfully"
    );
  }

  @Get("item-keys")
  @ApiOperation({ summary: "Get recipe item keys for search/autocomplete" })
  @ApiQuery({
    name: "name",
    required: false,
    type: String,
    description: "Search term for recipe names",
  })
  @ApiResponse({
    status: 200,
    description: "Recipe item keys retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getItemKeys(@Query("name") name?: string) {
    const items = await this.recipesService.getItemKeys(name);
    return this.responseService.success(
      items,
      "Recipe item keys retrieved successfully"
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get recipe by ID" })
  @ApiParam({ name: "id", description: "Recipe ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Recipe not found" })
  async findOne(@Param("id") id: string) {
    const recipe = await this.recipesService.findOne(id);
    return this.responseService.success(
      recipe,
      "Recipe retrieved successfully"
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create new recipe" })
  @ApiResponse({
    status: 201,
    description: "Recipe created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createRecipeDto: CreateRecipeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const recipe = await this.recipesService.create(createRecipeDto, user);
    return this.responseService.created(recipe, "Recipe created successfully");
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update recipe" })
  @ApiParam({ name: "id", description: "Recipe ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only update your own recipes",
  })
  @ApiResponse({ status: 404, description: "Recipe not found" })
  async update(
    @Param("id") id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const recipe = await this.recipesService.update(id, updateRecipeDto, user);
    return this.responseService.updated(recipe, "Recipe updated successfully");
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete recipe" })
  @ApiParam({ name: "id", description: "Recipe ID" })
  @ApiResponse({
    status: 200,
    description: "Recipe deleted successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - You can only delete your own recipes",
  })
  @ApiResponse({ status: 404, description: "Recipe not found" })
  async remove(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const result = await this.recipesService.remove(id, user);
    return this.responseService.success(result, "Recipe deleted successfully");
  }
}
