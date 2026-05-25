import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { setupJobSocketController } from "../socket-modules/controller/jobSocket.controller";

let io: SocketIOServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://your-frontend-domain.com", // Có thể thêm URL production vào đây
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Gắn các sự kiện liên quan đến theo dõi Job
    setupJobSocketController(socket, io);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
