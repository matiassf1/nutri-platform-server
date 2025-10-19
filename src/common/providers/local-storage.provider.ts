import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { StorageProvider } from "../interfaces/storage.interface";
import { StorageConfigService } from "../services/storage-config.service";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly storageConfigService: StorageConfigService) {
    this.uploadDir = path.join(process.cwd(), "uploads");
    this.baseUrl = "http://localhost:3000/uploads";

    // Crear directorio de uploads si no existe
    this.ensureUploadDir();
  }

  async uploadFile(
    file: any,
    key: string,
    bucket?: string
  ): Promise<{ url: string; key: string }> {
    try {
      const filePath = path.join(this.uploadDir, key);
      const dir = path.dirname(filePath);

      // Crear directorio si no existe
      await mkdir(dir, { recursive: true });

      // Escribir archivo
      await writeFile(filePath, file.buffer);

      const url = `${this.baseUrl}/${key}`;

      this.logger.log(`File uploaded successfully: ${key} to local storage`);

      return { url, key };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${key}`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, key);

      // Verificar si el archivo existe
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        this.logger.log(`File deleted successfully: ${key} from local storage`);
      } else {
        this.logger.warn(`File not found for deletion: ${key}`);
      }
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
    // Para storage local, simplemente retornamos la URL pública
    return `${this.baseUrl}/${key}`;
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

  private async ensureUploadDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.uploadDir)) {
        await mkdir(this.uploadDir, { recursive: true });
        this.logger.log(`Created upload directory: ${this.uploadDir}`);
      }
    } catch (error) {
      this.logger.error(`Failed to create upload directory: ${error.message}`);
    }
  }
}
