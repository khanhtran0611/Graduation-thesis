import { Request, Response } from "express";
import { sharedFileService } from "../service/image.service";
import ResponseUtils from "../../../../utils/responseUtils"; // Import đống utility trả về
import path from "path";

export class SharedFileController {
  /**
   * Xử lý upload ảnh
   * Sử dụng: ok(res, data)
   */
  async saveImage(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        // Trả về lỗi nếu không có file
        return ResponseUtils.error(res, "No image file provided");
      }

      // Gọi service xử lý trọn gói tên file và upload
      const result = await sharedFileService.addImage(file);

      // Trả về success 200 kèm data
      return ResponseUtils.ok(res, result);
    } catch (error: any) {
      console.error("Error in saveImage:", error);
      return ResponseUtils.error(res, error.message);
    }
  }

  /**
   * Xem ảnh (Proxy)
   * Sử dụng: notFound(res) hoặc error(res) khi có lỗi
   */
  async proxyImage(req: Request, res: Response) {
    try {
      const { fileName } = req.params;
      if (!fileName) {
        return ResponseUtils.error(res, "fileName is required");
      }

      const buffer = await sharedFileService.viewImage(fileName);

      const ext = path.extname(fileName).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
      };

      const contentType = mimeMap[ext] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

      // Giữ nguyên res.send vì đây là stream binary, không dùng ok(res) bọc JSON
      return res.status(200).send(buffer);
    } catch (error: any) {
      console.error("Error in proxyImage:", error);
      // Trả về 404 nếu không tìm thấy ảnh
      return ResponseUtils.notFound(res);
    }
  }

  /**
   * Xóa nhiều ảnh
   * Sử dụng: ok(res, data) hoặc invalidated(res, errors)
   */
  async deleteImages(req: Request, res: Response) {
    try {
      const { fileNames } = req.body;

      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        // Sử dụng invalidated để báo lỗi dữ liệu đầu vào không hợp lệ
        return ResponseUtils.invalidated(res, { fileNames: "Must be a non-empty array" });
      }

      await sharedFileService.removeManyImages(fileNames);

      // Trả về thành công kèm thông tin số lượng đã xóa
      return ResponseUtils.ok(res, {
        requested: fileNames.length,
        message: "Images deleted successfully",
      });
    } catch (error: any) {
      console.error("Error in deleteImages:", error);
      return ResponseUtils.error(res, error.message);
    }
  }
}

export const sharedFileController = new SharedFileController();
