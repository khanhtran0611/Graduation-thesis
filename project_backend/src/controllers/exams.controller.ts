import { Request, Response } from "express";
import { ExamDB } from "../models/exam.model";
import QuestionDB from "../models/question.model";
import {
  Exam,
  RootExamSummary,
  toRootExamSummary,
  NodeInfo,
  buildQuestionLatex,
  LATEX_TEMPLATE_VI,
  ExamDetail2,
  CombinedInfo,
} from "../types/exam";
import { OmittedQuestion3, SubQuestion3 } from "../types/questions";
import { ok } from "../utils/responseUtils";
import { latexService } from "./latex-service/service/latex.service";
import { GeneralInfo, GroupInfo } from "../types/exam";
import { UserDB } from "../models/user.model";

type QuestionMap = Record<string, CombinedInfo>;

type SaveRootExamRequestBody = {
  course_id: string;
  duration: number;
  name: string;
  user_id: string;
  total: number;
  questionMap: QuestionMap;
};

type GenerateExamCodesRequestBody = {
  id: string;
  desired_codes: number;
};

type FindExamByCodeRequestBody = {
  id: string;
  code: string;
};

type FindExamsByRootIdRequestBody = {
  id: string;
};

function getRandomElements<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, n);
}

class ExamsController {
  private shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  private generateUniqueShuffledLists<T>(items: T[], desiredCount: number): T[][] {
    if (!Array.isArray(items) || items.length === 0 || desiredCount <= 0) {
      return [];
    }

    const uniqueLists: T[][] = [];
    const seen = new Set<string>();
    const maxAttempts = Math.max(desiredCount * 30, 100);
    let attempts = 0;

    while (uniqueLists.length < desiredCount && attempts < maxAttempts) {
      const shuffled = this.shuffleArray(items);
      const key = JSON.stringify(shuffled);

      if (!seen.has(key)) {
        seen.add(key);
        uniqueLists.push(shuffled);
      }

      attempts += 1;
    }

    return uniqueLists;
  }

  public async saveRootExam(req: Request, res: Response): Promise<Response> {
    try {
      const { course_id, total, duration, name, user_id, questionMap } =
        req.body as SaveRootExamRequestBody;

      if (
        !course_id ||
        !name ||
        !user_id ||
        typeof duration !== "number" ||
        typeof total !== "number"
      ) {
        return res.status(400).json({
          message: "course_id, duration, name, user_id, total are required",
        });
      }

      if (!questionMap || typeof questionMap !== "object" || Array.isArray(questionMap)) {
        return res.status(400).json({
          message: "questionMap must be a valid object",
        });
      }

      const allQuestions: (string | string[])[] = [];
      const nodeInfoList: NodeInfo[] = [];

      for (const [nodeId, combinedInfo] of Object.entries(questionMap)) {
        let nodeQuestionCount = 0;

        // Xử lý GeneralInfo[]
        if (Array.isArray(combinedInfo.general_info)) {
          for (const gen of combinedInfo.general_info) {
            if (gen.count > 0) {
              const randomQuestions = await QuestionDB.aggregate([
                { $match: { node_id: nodeId, type: gen.type, difficulty: gen.difficulty } },
                { $sample: { size: gen.count } },
                { $project: { _id: 1 } },
              ]);

              randomQuestions.forEach((q) => {
                allQuestions.push(q._id.toString());
              });
              nodeQuestionCount += randomQuestions.length;
            }
          }
        }

        // Xử lý GroupInfo và GroupRequiredInfo
        const reqInfo = combinedInfo.group_required_info;
        const groupInfo = combinedInfo.group_info;

        if (reqInfo && reqInfo.count > 0 && Array.isArray(groupInfo) && groupInfo.length > 0) {
          const selectedGroups = getRandomElements(groupInfo, reqInfo.count);
          const groupIds = selectedGroups.map((g) => g.id);

          const groupQuestionsDocs = await QuestionDB.find({ _id: { $in: groupIds } }).lean();

          for (const group of selectedGroups) {
            const parentQ = groupQuestionsDocs.find((q) => q._id.toString() === group.id);

            if (parentQ && Array.isArray(parentQ.questions_list)) {
              const subCountToPick = reqInfo.sub_count;
              const selectedSubs =
                reqInfo.type === "sequential"
                  ? parentQ.questions_list.slice(0, subCountToPick)
                  : getRandomElements(parentQ.questions_list, subCountToPick);

              const subIds = selectedSubs
                .map((sq: any) => sq.id || sq._id?.toString())
                .filter(Boolean);

              // Tống id question cha ở đầu, sau đó là các id của subquestion
              const groupArr = [parentQ._id.toString(), ...subIds];
              allQuestions.push(groupArr);
              nodeQuestionCount += 1;
            }
          }
        }

        nodeInfoList.push({
          node_id: nodeId,
          count: nodeQuestionCount,
        });
      }

      const savedExam = await ExamDB.create({
        course_id,
        duration,
        name,
        user_id: user_id,
        questions_list: allQuestions,
        total,
        code: "",
        total_code: 0,
        node_info: nodeInfoList,
      });

      return res.status(201).json({
        message: "Exam saved successfully",
        data: savedExam,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async getExamQuestions(req: Request, res: Response): Promise<Response> {
    try {
      const { id: examId } = req.params;

      if (!examId) {
        return res.status(400).json({ message: "exam id is required" });
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
        return res.status(404).json({ message: "Exam not found" });
      }

      return ok(res, {
        id: (examDoc as any)._id,
        duration: (examDoc as any).duration,
        name: (examDoc as any).name,
        total: (examDoc as any).total,
        total_code: (examDoc as any).total_code,
        questions_list: (examDoc as any).questions_list,
        code: (examDoc as any).code,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async generateExamCodes(req: Request, res: Response): Promise<Response> {
    try {
      const { id, desired_codes } = req.body as GenerateExamCodesRequestBody;

      if (!id || typeof desired_codes !== "number" || desired_codes <= 0) {
        return res.status(400).json({
          message: "id and desired_codes (number > 0) are required",
        });
      }

      const parentExam = (await ExamDB.findById(id).lean()) as Exam;

      if (!parentExam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      const parentQuestionsList = parentExam.questions_list;

      if (parentQuestionsList.length === 0) {
        return res.status(400).json({ message: "questions_list is empty" });
      }

      const uniquePermutations = this.generateUniqueShuffledLists(
        parentQuestionsList,
        desired_codes
      );

      if (uniquePermutations.length < desired_codes) {
        return res.status(400).json({
          message: "Cannot generate enough unique shuffled questions_list",
          available_codes: uniquePermutations.length,
        });
      }

      const parentTotalCode = Number(parentExam.total_code) || 0;
      const codePadLength = Math.max(3, String(parentTotalCode + desired_codes).length);

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

      await ExamDB.updateOne(
        { _id: id },
        { $set: { total_code: parentTotalCode + desired_codes } }
      );

      return ok(res, {
        exam_id: id,
        desired_codes,
        created_count: createdExams.length,
        data: createdExams,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async getExamIdByRootAndCode(req: Request, res: Response): Promise<Response> {
    try {
      const { id, code } = req.body as FindExamByCodeRequestBody;

      if (!id || !code) {
        return res.status(400).json({ message: "id and code are required" });
      }

      const matchedExam = await ExamDB.findOne({ root_id: id, code }, { _id: 1 }).lean();

      if (!matchedExam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      return ok(res, {
        id: matchedExam._id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async getExamCodesByRootId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.body as FindExamsByRootIdRequestBody;

      if (!id) {
        return res.status(400).json({ message: "id is required" });
      }

      const matchedExams = await ExamDB.find({ root_id: id }, { _id: 1, code: 1 }).lean();

      return ok(res, {
        root_id: id,
        items: matchedExams.map((item) => ({
          id: item._id,
          code: item.code,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async getRootExamsByCourseId(req: Request, res: Response): Promise<Response> {
    try {
      const { course_id } = req.params;

      if (!course_id) {
        return res.status(400).json({ message: "course_id is required" });
      }

      // 1. Lấy danh sách exams (chỉ lấy user_id thay vì username)
      const rootExamDocs = await ExamDB.find(
        {
          course_id,
          $or: [{ root_id: { $exists: false } }, { root_id: null }, { root_id: "" }],
        },
        {
          user_id: 1, // Thay vì username
          duration: 1,
          name: 1,
          total: 1,
          createdAt: 1,
        }
      ).lean();

      // 2. Trích xuất danh sách user_id duy nhất để query (loại bỏ giá trị null/undefined)
      const userIds = [...new Set(rootExamDocs.map((doc: any) => doc.user_id).filter(Boolean))];

      // 3. Tìm thông tin users tương ứng từ UserDB
      const users = await UserDB.find(
        { _id: { $in: userIds } },
        { name: 1 } // Lấy trường name để làm username
      ).lean();

      // 4. Tạo một Map để tra cứu name theo user_id với độ phức tạp O(1)
      const userMap = new Map<string, string>();
      users.forEach((user) => {
        userMap.set(user._id.toString(), user.name || "Unknown");
      });

      // 5. Map dữ liệu để trả về, ghép nối username vào
      const root_exams: RootExamSummary[] = rootExamDocs.map((doc: any) => {
        // Lấy tên từ userMap, nếu không tìm thấy thì để "Unknown User"
        const username = userMap.get(doc.user_id?.toString()) || "Unknown User";

        // Truyền object đã được bổ sung username vào hàm toRootExamSummary
        return toRootExamSummary({ ...doc, username });
      });

      return ok(res, root_exams);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async deleteExamById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "id is required" });
      }

      const deletedExam = await ExamDB.findByIdAndDelete(id).lean();

      if (!deletedExam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      return ok(res, {
        id,
        deleted: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async getNodeInfo(req: Request, res: Response): Promise<Response> {
    try {
      const { node_id } = req.params;

      if (!node_id) {
        return res.status(400).json({ message: "node_id is required" });
      }

      // 1. Xử lý phần GeneralInfo (Bỏ qua type 'group')
      // Sử dụng aggregation để nhóm và đếm số lượng trong database cho tối ưu
      const rawGenerals = await QuestionDB.aggregate([
        {
          $match: {
            node_id: node_id,
            type: { $ne: "group" }, // Loại bỏ type group
          },
        },
        {
          $group: {
            _id: { type: "$type", difficulty: "$difficulty" },
            count: { $sum: 1 },
          },
        },
      ]);

      // Định nghĩa các loại type và difficulty theo yêu cầu
      const generalTypes = ["mcq", "blank-filling"];
      const difficulties = ["easy", "medium", "hard"];
      const generals: GeneralInfo[] = [];

      // Khởi tạo mảng generals để đảm bảo đủ 6 tổ hợp (kể cả những tổ hợp có count = 0)
      for (const t of generalTypes) {
        for (const d of difficulties) {
          const found = rawGenerals.find((g: any) => g._id.type === t && g._id.difficulty === d);
          generals.push({
            type: t,
            difficulty: d,
            count: found ? found.count : 0,
          });
        }
      }

      // 2. Xử lý phần GroupInfo (Chỉ lấy type 'group')
      const groupsDocs = await QuestionDB.find(
        { node_id: node_id, type: "group" },
        { _id: 1, questions_list: 1 }
      ).lean();

      const groups: GroupInfo[] = groupsDocs.map((doc: any) => ({
        id: doc._id.toString(),
        // Đếm số lượng phần tử trong questions_list, nếu không có thì trả về 0
        sub_count: Array.isArray(doc.questions_list) ? doc.questions_list.length : 0,
      }));

      // 3. Trả về kết quả thông qua hàm `ok` từ responseUtils
      return ok(res, {
        generals,
        groups,
      });
    } catch (err) {
      console.error("Error in getNodeInfo:", err);
      // Giả định bạn đã import `error` từ responseUtils, nếu chưa thì dùng res.status(500)
      return res.status(500).json({
        success: false,
        status: 500,
        message: "Internal server error",
      });
    }
  }
}

export default new ExamsController();
