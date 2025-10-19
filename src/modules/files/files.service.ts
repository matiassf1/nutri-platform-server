import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CurrentUserType } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async uploadFile(file: any, user: CurrentUserType) {
    // In a real implementation, you would upload to AWS S3
    const fileUrl = `https://example.com/files/${file.filename}`;

    const fileAttachment = await this.prismaService.fileAttachment.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        uploadedBy: user.id,
      },
    });

    this.logger.log(`File uploaded: ${fileAttachment.id} by user: ${user.id}`);

    return fileAttachment;
  }

  async generatePresignedUrl(
    filename: string,
    contentType: string,
    user: CurrentUserType
  ) {
    // In a real implementation, you would generate a presigned URL for AWS S3
    const presignedUrl = `https://example.com/presigned-upload/${filename}`;

    return {
      presignedUrl,
      fields: {
        key: filename,
        "Content-Type": contentType,
      },
    };
  }

  async getFile(id: string, user: CurrentUserType) {
    const file = await this.prismaService.fileAttachment.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error("File not found");
    }

    return file;
  }
}
