import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LocalStorageProvider } from "../providers/local-storage.provider";
import { S3StorageProvider } from "../providers/s3-storage.provider";
import { StorageConfigService } from "../services/storage-config.service";
import { StorageService } from "../services/storage.service";

@Module({
  imports: [ConfigModule],
  providers: [
    StorageConfigService,
    S3StorageProvider,
    LocalStorageProvider,
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
