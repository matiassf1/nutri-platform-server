import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";
import { StorageProvider } from "../interfaces/storage.interface";
import { StorageConfigService } from "../services/storage-config.service";

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly storageConfigService: StorageConfigService) {
    const config = this.storageConfigService.getStorageConfig();

    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId!,
        secretAccessKey: config.secretAccessKey!,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    });

    this.bucket = config.bucket;

    // Crear el bucket si no existe
    this.ensureBucketExists();
  }

  async uploadFile(
    file: any,
    key: string,
    bucket?: string
  ): Promise<{ url: string; key: string }> {
    try {
      const targetBucket = bucket || this.bucket;

      const command = new PutObjectCommand({
        Bucket: targetBucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const url = this.getPublicUrl(key, targetBucket);

      this.logger.log(
        `File uploaded successfully: ${key} to bucket: ${targetBucket}`
      );

      return { url, key };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      const targetBucket = bucket || this.bucket;

      const command = new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      await this.s3Client.send(command);

      this.logger.log(
        `File deleted successfully: ${key} from bucket: ${targetBucket}`
      );
    } catch (error) {
      this.logger.error(`Failed to delete file: ${key}`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getSignedUrl(
    key: string,
    bucket?: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const targetBucket = bucket || this.bucket;

      const command = new GetObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for: ${key}`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  generateKey(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split(".").pop();
    const baseName = originalName.split(".").slice(0, -1).join(".");

    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, "_");
    const key = `${prefix || "uploads"}/${timestamp}_${randomString}_${cleanBaseName}.${extension}`;

    return key;
  }

  private getPublicUrl(key: string, bucket?: string): string {
    const targetBucket = bucket || this.bucket;
    const config = this.storageConfigService.getStorageConfig();

    if (config.endpoint) {
      // LocalStack o endpoint personalizado
      return `${config.endpoint}/${targetBucket}/${key}`;
    }

    // AWS S3 real
    return `https://${targetBucket}.s3.${config.region}.amazonaws.com/${key}`;
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      // En LocalStack, el bucket se crea automáticamente al subir el primer archivo
      // En AWS real, necesitarías usar CreateBucketCommand
      this.logger.log(`Using bucket: ${this.bucket}`);
    } catch (error) {
      this.logger.warn(`Could not verify bucket existence: ${error.message}`);
    }
  }
}
