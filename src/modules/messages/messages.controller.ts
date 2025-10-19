import {
  Body,
  Controller,
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
import { CreateMessageDto, FindAllMessagesDto } from "./dto";
import { MessagesService } from "./messages.service";

@ApiTags("Messages")
@Controller("messages")
@ApiBearerAuth("JWT-auth")
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly responseService: ResponseService
  ) {}

  @Get()
  @ApiOperation({ summary: "Get messages with filters" })
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
    name: "receiverId",
    required: false,
    type: String,
    description: "Filter by receiver ID",
  })
  @ApiQuery({
    name: "isRead",
    required: false,
    type: Boolean,
    description: "Filter by read status",
  })
  @ApiResponse({
    status: 200,
    description: "Messages retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async findAll(
    @Query() query: FindAllMessagesDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.messagesService.findAll(query, user);
    return this.responseService.successWithPagination(
      result.data,
      result.pagination,
      "Messages retrieved successfully"
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Send new message" })
  @ApiResponse({
    status: 201,
    description: "Message sent successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: CurrentUserType
  ) {
    const message = await this.messagesService.create(createMessageDto, user);
    return this.responseService.created(message, "Message sent successfully");
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark message as read" })
  @ApiParam({ name: "id", description: "Message ID" })
  @ApiResponse({
    status: 200,
    description: "Message marked as read",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Message not found" })
  async markAsRead(
    @Param("id") id: string,
    @CurrentUser() user: CurrentUserType
  ) {
    const message = await this.messagesService.markAsRead(id, user);
    return this.responseService.updated(message, "Message marked as read");
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread message count" })
  @ApiResponse({
    status: 200,
    description: "Unread count retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUnreadCount(@CurrentUser() user: CurrentUserType) {
    const result = await this.messagesService.getUnreadCount(user);
    return this.responseService.success(
      result,
      "Unread count retrieved successfully"
    );
  }
}
