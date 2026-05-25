import { Worker } from "bullmq";
import { bullMQRedisClient, initializeRedis } from "../config/redis";
import { uploadFile, getPresignedUrl } from "../utils/minioUtils";
import { minioConfig, initializeMinIO } from "../config/minio";
import { latexService } from "../modules/common/latex-service/service/latex.service";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { connectDB } from "../config/database";

dotenv.config();

// Khởi tạo các kết nối cần thiết cho worker khi chạy độc lập
const initWorkerEnv = async () => {
  try {
    await connectDB();
    await initializeMinIO();
    await initializeRedis();
    console.log("Worker environment initialized successfully");
  } catch (error) {
    console.error("Failed to initialize worker environment:", error);
    process.exit(1);
  }
};

// Gọi hàm khởi tạo
initWorkerEnv();

export const latexWorker = new Worker(
  "latex-compile",
  async (job) => {
    const { images, texCode } = job.data as { images: string[]; texCode: string };
    if (!texCode) {
      throw new Error("texCode is required");
    }

    // Compile to PDF
    const pdfBuffer = await latexService.compileTexCodeToPdf(images || [], texCode);

    // Upload to MinIO PDF bucket
    const fileName = `compiled_${uuidv4()}.pdf`;
    await uploadFile(pdfBuffer, fileName, "application/pdf", minioConfig.pdfBucket);

    // Get presigned URL
    const presignedUrl = await getPresignedUrl(fileName, 3600, minioConfig.pdfBucket);

    return { presignedUrl, fileName };
  },
  { connection: bullMQRedisClient }
);

latexWorker.on("completed", (job, returnvalue) => {
  console.log(`Latex compile job ${job.id} completed. URL: ${returnvalue.presignedUrl}`);
});

latexWorker.on("failed", (job, err) => {
  console.error(`Latex compile job ${job?.id} failed with ${err.message}`);
});

console.log("Latex Worker is running and listening for jobs...");
