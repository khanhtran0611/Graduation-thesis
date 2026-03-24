import { Request, Response } from "express";
import { ExamDB } from "../models/exam.model";
import QuestionDB from "../models/question.model";
import { Exam } from "../types/exam";
import { OmittedQuestion, toOmittedQuestion } from "../types/questions";
import { ok } from "../utils/responseUtils";

type QuestionMap = Record<string, (string | string[])[]>;

type SaveRootExamRequestBody = {
  course_id: string;
  duration: number;
  name: string;
  username: string;
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

  private async getOmittedQuestionsByIds(questionIds: string[]): Promise<OmittedQuestion[]> {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return [];
    }

    const docs = await QuestionDB.find(
      { _id: { $in: questionIds } },
      {
        content: 1,
        image: 1,
        options: 1,
        type: 1,
      }
    ).lean();

    const docsMap = new Map<string, OmittedQuestion>();

    for (const doc of docs) {
      const omittedQuestion = toOmittedQuestion(doc);
      docsMap.set(omittedQuestion.id, omittedQuestion);
    }

    return questionIds
      .map((questionId) => docsMap.get(questionId))
      .filter((question): question is OmittedQuestion => Boolean(question));
  }

  public async saveRootExam(req: Request, res: Response): Promise<Response> {
    try {
      const { course_id, total, duration, name, username, questionMap } =
        req.body as SaveRootExamRequestBody;

      if (
        !course_id ||
        !name ||
        !username ||
        typeof duration !== "number" ||
        typeof total !== "number"
      ) {
        return res.status(400).json({
          message: "course_id, duration, name, username, total are required",
        });
      }

      if (!questionMap || typeof questionMap !== "object" || Array.isArray(questionMap)) {
        return res.status(400).json({
          message: "questionMap must be a valid object",
        });
      }

      const examQuestionsList: (string | string[])[] = [];

      for (const value of Object.values(questionMap)) {
        if (!Array.isArray(value)) {
          return res.status(400).json({
            message: "Each questionMap value must be an array",
          });
        }
        examQuestionsList.push(...value);
      }

      const savedExam = await ExamDB.create({
        course_id,
        duration,
        name,
        username,
        questions_list: examQuestionsList,
        total,
        code: "",
        total_code: 0,
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

      const questionsList = (examDoc as any).questions_list as (string | string[])[];

      const groupedQuestions: (OmittedQuestion | OmittedQuestion[])[] = [];
      const temp: string[] = [];

      for (const questionItem of questionsList) {
        if (typeof questionItem === "string") {
          temp.push(questionItem);
          continue;
        }

        if (Array.isArray(questionItem)) {
          if (temp.length > 0) {
            const bufferedQuestions = await this.getOmittedQuestionsByIds(temp);
            groupedQuestions.push(...bufferedQuestions);
            temp.length = 0;
          }

          const nestedQuestions = await this.getOmittedQuestionsByIds(questionItem);
          groupedQuestions.push(nestedQuestions);
        }
      }

      if (temp.length > 0) {
        const bufferedQuestions = await this.getOmittedQuestionsByIds(temp);
        groupedQuestions.push(...bufferedQuestions);
      }

      return ok(res, {
        exam_id: (examDoc as any)._id,
        duration: (examDoc as any).duration,
        name: (examDoc as any).name,
        total: (examDoc as any).total,
        total_code: (examDoc as any).total_code,
        questions_list: groupedQuestions,
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
        username: parentExam.username,
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
}

export default new ExamsController();
