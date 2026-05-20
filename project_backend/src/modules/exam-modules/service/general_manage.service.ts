import { ExamDB } from "../../../models/exam.model";
import { UserDB } from "../../../models/user.model";
import { Exam, RootExamSummary, toRootExamSummary } from "../../../types/exam";
import { generateUniqueShuffledLists } from "../utils/helper";

export class ServiceError extends Error {
  public status: number;
  public body: Record<string, unknown>;

  constructor(status: number, message: string, body?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.body = body ?? { message };
  }
}

export class GeneralManageService {
  public async getExamQuestions(examId: string) {
    if (!examId) {
      throw new ServiceError(400, "exam id is required");
    }

    const examDoc = await ExamDB.findById(examId, {
      questions_list: 1,
      duration: 1,
      name: 1,
      total: 1,
      total_code: 1,
      code: 1,
    }).lean();

    if (!examDoc) {
      throw new ServiceError(404, "Exam not found");
    }

    return {
      id: (examDoc as any)._id,
      duration: (examDoc as any).duration,
      name: (examDoc as any).name,
      total: (examDoc as any).total,
      total_code: (examDoc as any).total_code,
      questions_list: (examDoc as any).questions_list,
      code: (examDoc as any).code,
    };
  }

  public async generateExamCodes(id: string, desiredCodes: number) {
    if (!id || typeof desiredCodes !== "number" || desiredCodes <= 0) {
      throw new ServiceError(400, "id and desired_codes (number > 0) are required");
    }

    const parentExam = (await ExamDB.findById(id).lean()) as Exam;

    if (!parentExam) {
      throw new ServiceError(404, "Exam not found");
    }

    const parentQuestionsList = parentExam.questions_list;

    if (parentQuestionsList.length === 0) {
      throw new ServiceError(400, "questions_list is empty");
    }

    const uniquePermutations = generateUniqueShuffledLists(parentQuestionsList, desiredCodes);

    if (uniquePermutations.length < desiredCodes) {
      throw new ServiceError(400, "Cannot generate enough unique shuffled questions_list", {
        message: "Cannot generate enough unique shuffled questions_list",
        available_codes: uniquePermutations.length,
      });
    }

    const parentTotalCode = Number(parentExam.total_code) || 0;
    const codePadLength = Math.max(3, String(parentTotalCode + desiredCodes).length);

    const generatedExams = uniquePermutations.map((questionsList, index) => ({
      course_id: parentExam.course_id,
      duration: parentExam.duration,
      name: parentExam.name,
      user_id: parentExam.user_id,
      questions_list: questionsList,
      total: parentExam.total,
      total_code: -1,
      code: String(parentTotalCode + index + 1).padStart(codePadLength, "0"),
      root_id: id,
    }));

    const createdExams = await ExamDB.insertMany(generatedExams);

    await ExamDB.updateOne({ _id: id }, { $set: { total_code: parentTotalCode + desiredCodes } });

    return {
      exam_id: id,
      course_id: parentExam.course_id,
      desired_codes: desiredCodes,
      created_count: createdExams.length,
      data: createdExams,
    };
  }

  public async getExamIdByRootAndCode(id: string, code: string) {
    if (!id || !code) {
      throw new ServiceError(400, "id and code are required");
    }

    const matchedExam = await ExamDB.findOne({ root_id: id, code }, { _id: 1 }).lean();

    if (!matchedExam) {
      throw new ServiceError(404, "Exam not found");
    }

    return {
      id: (matchedExam as any)._id,
    };
  }

  public async getExamCodesByRootId(id: string) {
    if (!id) {
      throw new ServiceError(400, "id is required");
    }

    const matchedExams = await ExamDB.find({ root_id: id }, { _id: 1, code: 1 }).lean();

    return {
      root_id: id,
      items: matchedExams.map((item: any) => ({
        id: item._id,
        code: item.code,
      })),
    };
  }

  public async deleteExamById(id: string) {
    if (!id) {
      throw new ServiceError(400, "id is required");
    }

    const deletedExam = await ExamDB.findByIdAndDelete(id).lean();

    if (!deletedExam) {
      throw new ServiceError(404, "Exam not found");
    }

    return {
      id,
      course_id: (deletedExam as any).course_id?.toString() as string | undefined,
      deleted: true,
    };
  }

  public async getRootExamsByCourseId(courseId: string) {
    if (!courseId) {
      throw new ServiceError(400, "course_id is required");
    }

    const rootExamDocs = await ExamDB.find(
      {
        course_id: courseId,
        $or: [{ root_id: { $exists: false } }, { root_id: null }, { root_id: "" }],
      },
      {
        user_id: 1,
        duration: 1,
        name: 1,
        total: 1,
        createdAt: 1,
      }
    ).lean();

    const userIds = [...new Set(rootExamDocs.map((doc: any) => doc.user_id).filter(Boolean))];

    const users = await UserDB.find({ _id: { $in: userIds } }, { name: 1 }).lean();

    const userMap = new Map<string, string>();
    users.forEach((user: any) => {
      userMap.set(user._id.toString(), user.name || "Unknown");
    });

    const rootExams: RootExamSummary[] = rootExamDocs.map((doc: any) => {
      const username = userMap.get(doc.user_id?.toString()) || "Unknown User";
      return toRootExamSummary({ ...doc, username });
    });

    return rootExams;
  }

  public async editExam(id: string, body: Record<string, unknown>) {
    if (!id) {
      throw new ServiceError(400, "id is required");
    }

    const exam = await ExamDB.findById(id);
    if (!exam) {
      throw new ServiceError(404, "Exam not found");
    }

    Object.assign(exam, body);
    const changedFields = exam.modifiedPaths();
    const savedExam = await exam.save();

    return {
      data: savedExam,
      changedFields,
      course_id: savedExam.course_id,
    };
  }
}

const generalManageService = new GeneralManageService();
export default generalManageService;
