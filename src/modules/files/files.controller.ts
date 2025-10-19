import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CurrentUser,
  CurrentUserType,
} from "../../common/decorators/current-user.decorator";
import { ResponseService } from "../../common/services/response.service";
import { FilesService } from "./files.service";

@ApiTags("Files")
@Controller("files")
@ApiBearerAuth("JWT-auth")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly responseService: ResponseService
  ) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload file" })
  @ApiResponse({
    status: 201,
    description: "File uploaded successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid file" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async uploadFile(
    @UploadedFile() file: any,
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.filesService.uploadFile(file, user);
    return this.responseService.created(result, "File uploaded successfully");
  }

  @Post("presign")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Generate presigned URL for file upload" })
  @ApiResponse({
    status: 200,
    description: "Presigned URL generated successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async generatePresignedUrl(
    @Body() body: { filename: string; contentType: string },
    @CurrentUser() user: CurrentUserType
  ) {
    const result = await this.filesService.generatePresignedUrl(
      body.filename,
      body.contentType,
      user
    );
    return this.responseService.success(
      result,
      "Presigned URL generated successfully"
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get file information" })
  @ApiParam({ name: "id", description: "File ID" })
  @ApiResponse({
    status: 200,
    description: "File information retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "File not found" })
  async getFile(@Param("id") id: string, @CurrentUser() user: CurrentUserType) {
    const file = await this.filesService.getFile(id, user);
    return this.responseService.success(
      file,
      "File information retrieved successfully"
    );
  }
}
