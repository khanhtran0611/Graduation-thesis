import { ExamDB } from "../../../models/exam.model";
import QuestionDB from "../../../models/question.model";
import { CombinedInfo, NodeInfo } from "../../../types/exam";
import { getRandomElements } from "../utils/helper";
import {
  ISaveRootExamService,
  SaveRootExamRequestBody,
} from "../interfaces/exam_metadata.interface";
import { ServiceError } from "./general_manage.service";
import { OmittedQuestion2 } from "../../../types/questions";

export class SaveRootExamServiceV1 implements ISaveRootExamService {
  getVersion(): string {
    return "V1";
  }

  public async saveRootExam(body: SaveRootExamRequestBody) {
    const { course_id, total, duration, name, user_id, questionMap } = body;

    if (
      !course_id ||
      !name ||
      !user_id ||
      typeof duration !== "number" ||
      typeof total !== "number"
    ) {
      throw new ServiceError(400, "course_id, duration, name, user_id, total are required");
    }

    if (!questionMap || typeof questionMap !== "object" || Array.isArray(questionMap)) {
      throw new ServiceError(400, "questionMap must be a valid object");
    }

    const allQuestions: OmittedQuestion2[] = [];
    const nodeInfoList: NodeInfo[] = [];

    for (const [nodeId, combinedInfo] of Object.entries(
      questionMap as Record<string, CombinedInfo>
    )) {
      let nodeQuestionCount = 0;

      if (Array.isArray(combinedInfo.general_info)) {
        for (const gen of combinedInfo.general_info) {
          if (gen.count > 0) {
            const randomQuestions = await QuestionDB.aggregate([
              { $match: { node_id: nodeId, type: gen.type, difficulty: gen.difficulty } },
              { $sample: { size: gen.count } },
              { $project: { _id: 1 } },
            ]);

            randomQuestions.forEach((q) => {
              allQuestions.push({
                id: q._id.toString(),
                questions_list: [],
              });
            });
            nodeQuestionCount += randomQuestions.length;
          }
        }
      }

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

            allQuestions.push({
              id: parentQ._id.toString(),
              questions_list: subIds,
            });
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
      user_id,
      questions_list: allQuestions,
      total,
      code: "",
      total_code: 0,
      node_info: nodeInfoList,
    });

    return {
      message: "Exam saved successfully",
      data: savedExam,
    };
  }
}
