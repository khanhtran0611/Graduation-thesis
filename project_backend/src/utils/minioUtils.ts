import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, minioConfig } from "../config/minio";
import { Readable } from "stream";

/**
 * Upload file to MinIO
 * @param file Buffer or Readable stream
 * @param fileName Name of the file in bucket
 * @param contentType MIME type
 * @returns Object URL
 */
export const uploadFile = async (
  file: Buffer | Readable,
  fileName: string,
  contentType: string = "application/octet-stream"
): Promise<string> => {
  try {
    const command = new PutObjectCommand({
      Bucket: minioConfig.bucket,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL accessible from browser
    const url = `${minioConfig.useSSL ? "https" : "http"}://${minioConfig.publicEndpoint}:${minioConfig.port}/${minioConfig.bucket}/${fileName}`;
    return url;
  } catch (error) {
    console.error("Error uploading file to MinIO:", error);
    throw new Error("Failed to upload file");
  }
};

/**
 * Get presigned URL for secure file access
 * @param fileName Name of the file
 * @param expiresIn Expiration time in seconds (default: 3600)
 * @returns Presigned URL
 */
export const getPresignedUrl = async (
  fileName: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: minioConfig.bucket,
      Key: fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

/**
 * Delete file from MinIO
 * @param fileName Name of the file to delete
 */
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: minioConfig.bucket,
      Key: fileName,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file from MinIO:", error);
    throw new Error("Failed to delete file");
  }
};

/**
 * List all files in bucket
 * @param prefix Optional prefix to filter files
 * @returns Array of file names
 */
export const listFiles = async (prefix?: string): Promise<string[]> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: minioConfig.bucket,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key || "") || [];
  } catch (error) {
    console.error("Error listing files from MinIO:", error);
    throw new Error("Failed to list files");
  }
};

/**
 * Download file from MinIO
 * @param fileName Name of the file to download
 * @returns File buffer
 */
export const downloadFile = async (fileName: string): Promise<Buffer> => {
  try {
    const command = new GetObjectCommand({
      Bucket: minioConfig.bucket,
      Key: fileName,
    });

    const response = await s3Client.send(command);

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  } catch (error) {
    console.error("Error downloading file from MinIO:", error);
    throw new Error("Failed to download file");
  }
};
