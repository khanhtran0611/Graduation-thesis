import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const minioEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const minioPort = process.env.MINIO_PORT || "9000";
const minioAccessKey = process.env.MINIO_ACCESS_KEY || "minioadmin";
const minioSecretKey = process.env.MINIO_SECRET_KEY || "minioadmin";
const minioUseSSL = process.env.MINIO_USE_SSL === "true";
const minioBucket = process.env.MINIO_BUCKET || "gr2-bucket";
const minioPdfBucket = process.env.MINIO_PDF_BUCKET || "gr2-pdf-bucket";
// Public endpoint for generating URLs accessible from browser
const minioPublicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT || minioEndpoint;

// Configure MinIO S3 Client
export const s3Client = new S3Client({
  endpoint: `${minioUseSSL ? "https" : "http"}://${minioEndpoint}:${minioPort}`,
  region: "us-east-1", // MinIO doesn't require specific region but AWS SDK needs it
  credentials: {
    accessKeyId: minioAccessKey,
    secretAccessKey: minioSecretKey,
  },
  forcePathStyle: true, // Required for MinIO
  tls: minioUseSSL,
});

export const publicS3Client = new S3Client({
  endpoint: `${minioUseSSL ? "https" : "http"}://${minioPublicEndpoint}:${minioPort}`,
  region: "us-east-1",
  credentials: {
    accessKeyId: minioAccessKey,
    secretAccessKey: minioSecretKey,
  },
  forcePathStyle: true,
  tls: minioUseSSL,
});

// Initialize MinIO - Create bucket if not exists
export const initializeMinIO = async (): Promise<void> => {
  try {
    // Check if bucket exists
    let bucketExists = false;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: minioBucket }));
      console.log(`MinIO bucket '${minioBucket}' already exists`);
      bucketExists = true;
    } catch (error) {
      // Bucket doesn't exist, create it
      await s3Client.send(new CreateBucketCommand({ Bucket: minioBucket }));
      console.log(`MinIO bucket '${minioBucket}' created successfully`);
      bucketExists = true;
    }

    // Set public read policy for the bucket
    if (bucketExists) {
      const bucketPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${minioBucket}/*`],
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: minioBucket,
          Policy: JSON.stringify(bucketPolicy),
        })
      );
      console.log(`MinIO bucket '${minioBucket}' is now publicly accessible`);
    }

    // Check if PDF bucket exists
    let pdfBucketExists = false;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: minioPdfBucket }));
      console.log(`MinIO bucket '${minioPdfBucket}' already exists`);
      pdfBucketExists = true;
    } catch (error) {
      // Bucket doesn't exist, create it
      await s3Client.send(new CreateBucketCommand({ Bucket: minioPdfBucket }));
      console.log(`MinIO bucket '${minioPdfBucket}' created successfully`);
      pdfBucketExists = true;
    }

    // Set public read policy for the PDF bucket
    if (pdfBucketExists) {
      const pdfBucketPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${minioPdfBucket}/*`],
          },
        ],
      };

      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: minioPdfBucket,
          Policy: JSON.stringify(pdfBucketPolicy),
        })
      );
      console.log(`MinIO bucket '${minioPdfBucket}' is now publicly accessible`);

      // Attempt to set Lifecycle Configuration
      // Note: AWS S3 API only supports 'Days' as an integer for expiration rules.
      // 1 Day is the minimum allowed by the S3 API for standard bucket lifecycle expiration.
      await s3Client.send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: minioPdfBucket,
          LifecycleConfiguration: {
            Rules: [
              {
                ID: "ExpirePDFs",
                Status: "Enabled",
                Filter: { Prefix: "" },
                Expiration: { Days: 1 }, 
              },
            ],
          },
        })
      );
      console.log(`MinIO bucket '${minioPdfBucket}' lifecycle configured (expiration set to 1 day minimum)`);
    }
  } catch (error) {
    console.error("Failed to initialize MinIO:", error);
    // Don't exit process, MinIO might not be required for all operations
  }
};

export const minioConfig = {
  endpoint: minioEndpoint,
  port: minioPort,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
  useSSL: minioUseSSL,
  bucket: minioBucket,
  pdfBucket: minioPdfBucket,
  publicEndpoint: minioPublicEndpoint,
};
