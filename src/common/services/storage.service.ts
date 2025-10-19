import { Injectable, Logger } from "@nestjs/common";
import { StorageProvider, UploadResult } from "../interfaces/storage.interface";
import { LocalStorageProvider } from "../providers/local-storage.provider";
import { S3StorageProvider } from "../providers/s3-storage.provider";
import { StorageConfigService } from "./storage-config.service";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: StorageProvider;

  constructor(
    private readonly s3Provider: S3StorageProvider,
    private readonly localProvider: LocalStorageProvider,
    private readonly storageConfigService: StorageConfigService
  ) {
    const config = this.storageConfigService.getStorageConfig();

    switch (config.provider) {
      case "s3":
        this.provider = this.s3Provider;
        break;
      case "local":
        this.provider = this.localProvider;
        break;
      case "cloudinary":
        // TODO: Implementar CloudinaryProvider
        throw new Error("Cloudinary storage provider not implemented yet");
      default:
        throw new Error(`Unsupported storage provider: ${config.provider}`);
    }

    this.logger.log(
      `Storage service initialized with provider: ${config.provider}`
    );
  }

  async uploadFile(
    file: any,
    key?: string,
    bucket?: string
  ): Promise<UploadResult> {
    try {
      const finalKey =
        key || this.provider.generateKey(file.originalname, "avatars");
      const result = await this.provider.uploadFile(file, finalKey, bucket);

      return {
        url: result.url,
        key: result.key,
        bucket: bucket || this.storageConfigService.getStorageConfig().bucket,
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      this.logger.error("Failed to upload file", error);
      throw error;
    }
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      await this.provider.deleteFile(key, bucket);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw error;
    }
  }

  async getSignedUrl(
    key: string,
    bucket?: string,
    expiresIn?: number
  ): Promise<string> {
    try {
      return await this.provider.getSignedUrl(key, bucket, expiresIn);
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for: ${key}`, error);
      throw error;
    }
  }

  generateKey(originalName: string, prefix?: string): string {
    return this.provider.generateKey(originalName, prefix);
  }
}
