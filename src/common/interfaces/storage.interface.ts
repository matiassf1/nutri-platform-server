export interface StorageProvider {
  uploadFile(
    file: any,
    key: string,
    bucket: string
  ): Promise<{ url: string; key: string }>;

  deleteFile(key: string, bucket: string): Promise<void>;

  getSignedUrl(
    key: string,
    bucket: string,
    expiresIn?: number
  ): Promise<string>;

  generateKey(originalName: string, prefix?: string): string;
}

export interface StorageConfig {
  provider: "s3" | "local" | "cloudinary";
  bucket: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
  originalName: string;
}
