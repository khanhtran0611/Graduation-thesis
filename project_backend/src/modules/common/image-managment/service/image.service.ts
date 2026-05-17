import { uploadFile, downloadFile, deleteFile } from "../../../../utils/minioUtils";
import { v4 as uuidv4 } from "uuid";
import "multer";

export class SharedFileService {
  /**
   * Tự động tạo tên file unique và upload lên MinIO
   * @param file Đối tượng file từ req.file
   * @returns Object chứa URL và fileName đã tạo để lưu vào DB
   */
  async addImage(file: Express.Multer.File): Promise<{ url: string; fileName: string }> {
    // 1. Logic tạo tên file unique: uuid + timestamp + extension
    const fileExtension = file.originalname.split(".").pop(); //
    const fileName = `${uuidv4()}_${Date.now()}.${fileExtension}`; //

    // 2. Gọi utility để thực hiện upload thực tế
    const url = await uploadFile(file.buffer, fileName, file.mimetype); //

    // Trả về cả 2 để Controller/Service khác có cái mà dùng
    return { url, fileName };
  }

  /**
   * Lấy Buffer file từ MinIO qua tên file
   */
  async viewImage(fileName: string): Promise<Buffer> {
    return await downloadFile(fileName); //
  }

  /**
   * Xóa 1 file qua tên file
   */
  async removeImage(fileName: string): Promise<void> {
    await deleteFile(fileName); //
  }

  /**
   * Xóa nhiều file cùng lúc từ mảng tên file
   */
  async removeManyImages(fileNames: string[]): Promise<void> {
    // Thực hiện xóa song song các file dựa trên danh sách tên
    await Promise.allSettled(fileNames.map((name) => deleteFile(name))); //
  }
}

export const sharedFileService = new SharedFileService();
