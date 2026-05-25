import { Socket, Server } from "socket.io";
import { QueueEvents } from "bullmq";
import { bullMQRedisClient } from "../../config/redis";

// Dùng chung một QueueEvents listener cho toàn bộ server thay vì tạo mới mỗi lần có kết nối
let latexQueueEvents: QueueEvents | null = null;

const initQueueEvents = (io: Server) => {
  if (latexQueueEvents) return;

  latexQueueEvents = new QueueEvents("latex-compile", {
    connection: bullMQRedisClient,
  });

  latexQueueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`[Socket] Job ${jobId} completed`);
    
    // BullMQ QueueEvents thường trả về returnvalue dưới dạng chuỗi JSON stringified qua Pub/Sub
    let parsedResult = returnvalue;
    if (typeof returnvalue === "string") {
      try {
        parsedResult = JSON.parse(returnvalue);
      } catch (e) {
        console.error("Failed to parse returnvalue JSON", e);
      }
    }

    // Gửi kết quả tới room mang tên chính jobId đó
    io.to(jobId).emit("jobCompleted", {
      jobId,
      result: parsedResult,
    });
  });

  latexQueueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`[Socket] Job ${jobId} failed: ${failedReason}`);
    
    // Báo lỗi cho các client đang đợi
    io.to(jobId).emit("jobFailed", {
      jobId,
      error: failedReason,
    });
  });
};

export const setupJobSocketController = (socket: Socket, io: Server) => {
  // Khởi tạo trình lắng nghe từ BullMQ nếu chưa có
  initQueueEvents(io);

  // Client gọi sự kiện này và truyền jobId để báo là muốn nhận kết quả
  socket.on("subscribeToJob", (data: { jobId: string }) => {
    if (data && data.jobId) {
      console.log(`Socket ${socket.id} subscribed to job ${data.jobId}`);
      // Join vào phòng mang tên jobId
      socket.join(data.jobId);
    }
  });

  // Client gọi sự kiện này khi không muốn đợi nữa hoặc đã xử lý xong
  socket.on("unsubscribeFromJob", (data: { jobId: string }) => {
    if (data && data.jobId) {
      console.log(`Socket ${socket.id} unsubscribed from job ${data.jobId}`);
      socket.leave(data.jobId);
    }
  });
};
