import QuestionDB from "../../../models/question.model";
import { ExamDetail2 } from "../../../types/exam";
import { OmittedQuestion2, OmittedQuestion3, SubQuestion3 } from "../../../types/questions";
import { ResolvedExamData } from "./data-resolver.data";

export class ExamDataResolver {
  /**
   * Hàm chính được gọi từ bên ngoài.
   * Nhận vào exam thô, trả về data sạch.
   */
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

      // 1. Trích xuất ảnh của câu cha
      this.extractImagesFromDoc(qDoc, extractedImages);

      let finalSubQuestions: SubQuestion3[] = [];

      // 2. Xử lý sub-questions nếu là group
      if (qDoc.type === "group" && Array.isArray(qDoc.questions_list)) {
        const subIds = item.questions_list || [];
        const matchedSubs = qDoc.questions_list.filter((sq: any) =>
          subIds.includes(sq.id || sq._id?.toString())
        );

        matchedSubs.forEach((sq: any) => {
          this.extractImagesFromDoc(sq, extractedImages); // Trích xuất ảnh câu con

          finalSubQuestions.push({
            content: sq.content,
            options: sq.options || [],
            type: sq.type,
            option_max_size: sq.option_max_size,
          });
        });
      }

      orderedQuestions.push({
        content: qDoc.content,
        options: qDoc.options || [],
        type: qDoc.type,
        option_max_size: qDoc.option_max_size,
        questions_list: finalSubQuestions,
      });
    });

    // 3. Lọc trùng ảnh
    const finalImagesList = [...new Set(extractedImages.filter(Boolean))];

    return {
      orderedQuestions,
      images: finalImagesList,
    };
  }

  /**
   * Hàm helper nhỏ chuyên tìm ảnh trong question và options
   */
  private extractImagesFromDoc(doc: any, imageArray: string[]) {
    if (Array.isArray(doc.image)) {
      imageArray.push(...doc.image);
    }
    if (Array.isArray(doc.options) && doc.type === "mcq") {
      doc.options.forEach((opt: any) => {
        if (opt.image) imageArray.push(opt.image);
      });
    }
  }
}
