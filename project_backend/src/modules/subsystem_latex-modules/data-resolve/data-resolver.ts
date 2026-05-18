import QuestionDB from "../../../models/question.model";
import { ExamDetail2 } from "../../../types/exam";
import { OmittedQuestion2, OmittedQuestion3, SubQuestion3 } from "../../../types/questions";
import { AbstractDataResolver } from "./data-resolver.abstract";
import { ResolvedExamData } from "./data-resolver.data";
import { DataResolverRegistry, DataTypeRegistry } from "./data-resolver.registry";

export class ExamDataResolver {
  /**
   * Hàm chính được gọi từ bên ngoài.
   * Nhận vào exam thô, trả về data sạch.
   */

  private resolverCache = new Map<string, AbstractDataResolver>();

  private recursiveFactory = (type: string): AbstractDataResolver => {
    const versionKey = DataTypeRegistry[type] || DataTypeRegistry.mcq;

    if (this.resolverCache.has(versionKey)) {
      return this.resolverCache.get(versionKey)!;
    }

    const ResolverClass = DataResolverRegistry[versionKey];
    if (!ResolverClass) {
      throw new Error(`DataResolver version ${versionKey} not found in registry`);
    }

    const instance = new ResolverClass();
    this.resolverCache.set(versionKey, instance);
    return instance;
  };

  public async resolve(exam: ExamDetail2): Promise<ResolvedExamData> {
    const orderedParentIds = this.extractParentIds(exam.questions_list);

    // Truy vấn DB
    const fetchedQuestionsDocs = await QuestionDB.find({
      _id: { $in: orderedParentIds },
    }).lean();

    // Map dữ liệu và bóc tách ảnh
    return this.buildOrderedDataAndExtractImages(exam.questions_list, fetchedQuestionsDocs);
  }

  /**
   * Tách hàm lấy ID cha cho dễ đọc
   */
  private extractParentIds(questionsList: OmittedQuestion2[]): string[] {
    const parentIds: string[] = [];
    questionsList.forEach((item) => {
      if (item?.id) {
        parentIds.push(item.id);
      }
    });
    return parentIds;
  }

  /**
   * Bê toàn bộ logic map dữ liệu và lấy ảnh từ Controller vào đây
   */
  private buildOrderedDataAndExtractImages(
    questionsList: OmittedQuestion2[],
    fetchedQuestionsDocs: any[]
  ): ResolvedExamData {
    const orderedQuestions: OmittedQuestion3[] = [];
    const extractedImages: string[] = [];

    questionsList.forEach((item) => {
      const qDoc = fetchedQuestionsDocs.find((q) => q._id.toString() === item.id);
      if (!qDoc) return;

      // Kích hoạt Factory để lấy đúng thợ xử lý data
      const resolver = this.recursiveFactory(qDoc.type);

      // Thợ tự lo việc build cấu trúc và đẩy ảnh vào mảng extractedImages
      const questionData = resolver.resolve(qDoc, item, extractedImages, this.recursiveFactory);

      orderedQuestions.push(questionData);
    });

    // Lọc trùng ảnh chung ở ngoài cùng
    const finalImagesList = [...new Set(extractedImages.filter(Boolean))];

    return {
      orderedQuestions,
      images: finalImagesList,
    };
  }
}
