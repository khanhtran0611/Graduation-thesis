// Khai báo class con
import { AbstractDataResolver } from "./data-resolver.abstract";
import { OmittedQuestion3, SubQuestion3 } from "../../../types/questions";

// ==========================================
// 1. MCQ DATA RESOLVER
// ==========================================
export class MCQDataResolver extends AbstractDataResolver {
  public getVersion(): string {
    return "mcq-data-v1";
  }

  protected buildSpecificData(
    qDoc: any,
    item: any,
    imageArray: string[],
    _factoryFunc: (type: string) => AbstractDataResolver
  ): OmittedQuestion3 {
    // Không cần gọi extractImages nữa, cha đã làm hộ ở tầng trên rồi!
    // Chỉ làm việc đặc thù của MCQ: Lấy ảnh trong options (line 99)
    if (Array.isArray(qDoc.options)) {
      qDoc.options.forEach((opt: any) => {
        if (opt.image) imageArray.push(opt.image);
      });
    }

    return {
      content: qDoc.content,
      options: qDoc.options || [],
      type: qDoc.type,
      option_max_size: qDoc.option_max_size,
      questions_list: [],
    };
  }
}

// ==========================================
// 3. GROUP DATA RESOLVER
// ==========================================
export class GroupDataResolver extends AbstractDataResolver {
  public getVersion(): string {
    return "group-data-v1";
  }

  protected buildSpecificData(
    qDoc: any,
    item: any,
    imageArray: string[],
    factoryFunc: any
  ): OmittedQuestion3 {
    const finalSubQuestions: SubQuestion3[] = [];

    if (Array.isArray(qDoc.questions_list)) {
      const subIds = item.questions_list || [];
      const matchedSubs = qDoc.questions_list.filter((sq: any) =>
        subIds.includes(sq.id || sq._id?.toString())
      );

      matchedSubs.forEach((sq: any) => {
        const subResolver = factoryFunc(sq.type);

        // ĐỆ QUY: Gọi hàm `resolve()` (Template Method) của thằng con chứ không gọi hàm cụ thể
        const subData = subResolver.resolve(sq, sq, imageArray, factoryFunc);

        finalSubQuestions.push({
          content: subData.content,
          options: subData.options,
          type: subData.type,
          option_max_size: subData.option_max_size,
        });
      });
    }

    return {
      content: qDoc.content,
      options: qDoc.options || [],
      type: qDoc.type,
      option_max_size: qDoc.option_max_size,
      questions_list: finalSubQuestions,
    };
  }
}

// ==========================================
// 2. FILLING DATA RESOLVER
// ==========================================
export class FillingDataResolver extends AbstractDataResolver {
  protected buildSpecificData(
    qDoc: any,
    item: any,
    imageArray: string[],
    _factoryFunc: (type: string) => AbstractDataResolver
  ): OmittedQuestion3 {
    return {
      content: qDoc.content,
      options: qDoc.options || [],
      type: qDoc.type,
      option_max_size: qDoc.option_max_size,
      questions_list: [],
    };
  }

  public getVersion(): string {
    return "filling-data-v1";
  }
}
