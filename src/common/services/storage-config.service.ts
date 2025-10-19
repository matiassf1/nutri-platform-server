import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageConfig } from "../interfaces/storage.interface";

@Injectable()
export class StorageConfigService {
  constructor(private readonly configService: ConfigService) {}

  getStorageConfig(): StorageConfig {
    const provider = this.configService.get<string>(
      "STORAGE_PROVIDER",
      "local"
    );
    const bucket = this.configService.get<string>(
      "STORAGE_BUCKET",
      "nutrition-platform"
    );
    const region = this.configService.get<string>("AWS_REGION", "us-east-1");
    const accessKeyId = this.configService.get<string>(
      "AWS_ACCESS_KEY_ID",
      "test"
    );
    const secretAccessKey = this.configService.get<string>(
      "AWS_SECRET_ACCESS_KEY",
      "test"
    );
    const endpoint = this.configService.get<string>(
      "AWS_ENDPOINT",
      "http://localhost:4566"
    );
    const forcePathStyle = this.configService.get<boolean>(
      "AWS_FORCE_PATH_STYLE",
      true
    );

    return {
      provider: provider as "s3" | "local" | "cloudinary",
      bucket,
      region,
      accessKeyId,
      secretAccessKey,
      endpoint,
      forcePathStyle,
    };
  }
}
