import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class CloudStorageService {
  private storage: Storage;

  constructor() {
    this.storage = new Storage();
  }

  /**
   * Uploads a file to a Google Cloud Storage bucket
   * @param bucketName - The name of the bucket
   * @param fileName - The name to give the file in storage
   * @param fileBuffer - The file content as a Buffer
   * @param contentType - Optional MIME type of the file
   * @returns Promise with upload results
   */
  public async uploadFile(bucketName: string, fileName: string, fileBuffer: Buffer, contentType?: string): Promise<any> {
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);

    const options = contentType ? { contentType } : undefined;

    return new Promise((resolve, reject) => {
      const stream = file.createWriteStream(options);

      stream.on('error', err => {
        reject(err);
      });

      stream.on('finish', async () => {
        console.log(`gs://${bucketName}/${fileName} uploaded successfully`);
        resolve({
          success: true,
          fileName,
          path: `gs://${bucketName}/${fileName}`,
        });
      });

      stream.end(fileBuffer);
    });
  }

  /**
   * Deletes a file from a Google Cloud Storage bucket
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file to delete
   * @returns Promise with deletion results
   */
  public async deleteStorageFile(bucketName: string, fileName: string): Promise<any> {
    const _results = await this.storage.bucket(bucketName).file(fileName).delete();
    console.log(`gs://${bucketName}/${fileName} deleted`);
    return _results;
  }

  /**
   * Gets a file from a Google Cloud Storage bucket
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file to get
   * @returns Promise with the file contents as a Buffer
   */
  public async getFile(bucketName: string, fileName: string): Promise<Buffer> {
    const file = this.storage.bucket(bucketName).file(fileName);
    const [fileContent] = await file.download();
    return fileContent;
  }

  /**
   * Generates a signed URL for temporary access to a file
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file
   * @param expiresInMinutes - How long the URL should be valid (default: 15 minutes)
   * @returns Promise with the signed URL
   */
  public async generateSignedUrl(bucketName: string, fileName: string, expiresInMinutes = 15): Promise<string> {
    const options = {
      version: 'v4' as const,
      action: 'read' as const,
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    };

    const [url] = await this.storage.bucket(bucketName).file(fileName).getSignedUrl(options);

    return url;
  }

  /**
   * Lists all files in a bucket with optional prefix filter
   * @param bucketName - The name of the bucket
   * @param prefix - Optional prefix to filter files (like a folder path)
   * @returns Promise with array of file metadata
   */
  public async listFiles(bucketName: string, prefix?: string): Promise<any[]> {
    const options = prefix ? { prefix } : undefined;
    const [files] = await this.storage.bucket(bucketName).getFiles(options);

    return files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      updated: file.metadata.updated,
      timeCreated: file.metadata.timeCreated,
    }));
  }

  /**
   * Checks if a file exists in a bucket
   * @param bucketName - The name of the bucket
   * @param fileName - The name of the file to check
   * @returns Promise with boolean indicating if file exists
   */
  public async fileExists(bucketName: string, fileName: string): Promise<boolean> {
    const file = this.storage.bucket(bucketName).file(fileName);
    const [exists] = await file.exists();
    return exists;
  }
}
