import express, { Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import route from "./routes/routes";
import dotenv from "dotenv";
import { connectDB } from "../src/config/database";
import { initializeMinIO } from "../src/config/minio";
dotenv.config();
export const app = express();
const port = process.env.PORT || 5000;

// Initialize database and MinIO
connectDB();
initializeMinIO();

const allowedOrigins = [
  "http://localhost:3000", // Dành cho môi trường phát triển (Next.js/React mặc định)
  "https://your-frontend-domain.com", // Dành cho môi trường production
  // Thêm các domain khác nếu cần
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Cho phép các request không có origin (như mobile apps, curl, hoặc same-origin)
    if (!origin) return callback(null, true);

    // Kiểm tra xem origin có trong danh sách được phép không
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `Chính sách CORS của site này không cho phép truy cập từ Origin ${origin}.`;
      return callback(new Error(msg), false);
    }

    // Cho phép origin
    return callback(null, true);
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Các phương thức HTTP được phép
  credentials: true, // Cho phép gửi cookies (quan trọng nếu dùng session/JWT trong cookie)
  optionsSuccessStatus: 204, // (Tùy chọn) Một số trình duyệt yêu cầu 204 cho Pre-flight
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(cookieParser());

// Health check endpoint for Docker
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req: Request, res: Response) => {
  res.send(process.env.MESSAGE);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
route(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
