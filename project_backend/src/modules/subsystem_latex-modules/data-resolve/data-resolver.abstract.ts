// Khai báo abstract class cha
import { OmittedQuestion3 } from "../../../types/questions";

export abstract class AbstractDataResolver {
  public abstract getVersion(): string;

  // 1. ĐÂY CHÍNH LÀ TEMPLATE METHOD (Bộ khung thuật toán cố định)
  public resolve(
    qDoc: any,
    item: any,
    imageArray: string[],
    factoryFunc: (type: string) => AbstractDataResolver
  ): OmittedQuestion3 {
    // Bước 1: Chạy logic chung (Tất cả các loại câu hỏi đều phải lấy ảnh gốc)
    this.extractImages(qDoc, imageArray);

    // Bước 2: Gọi đến "khoảng trống" để class con tự xử lý logic riêng của nó
    return this.buildSpecificData(qDoc, item, imageArray, factoryFunc);
  }

  // Giấu hàm này đi, không cho class con tự ý gọi hoặc sửa đổi nữa
  private extractImages(doc: any, imageArray: string[]): void {
    if (Array.isArray(doc.image)) {
      imageArray.push(...doc.image);
    }
  }

  // "Khoảng trống" để các class con tự điền logic riêng vào
  protected abstract buildSpecificData(
    qDoc: any,
    item: any,
    imageArray: string[],
    factoryFunc: (type: string) => AbstractDataResolver
  ): OmittedQuestion3;
}
