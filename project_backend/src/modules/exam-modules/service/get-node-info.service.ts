import QuestionDB from "../../../models/question.model";
import { ExamDB } from "../../../models/exam.model";
import TreeNode from "../../../models/course_hierarchy";
import { GeneralInfo, GroupInfo, NodeExamInfo } from "../../../types/exam";
import { IGetNodeInfoService } from "../interfaces/exam_metadata.interface";
import { ServiceError } from "./general_manage.service";

export class GetNodeInfoServiceV1 implements IGetNodeInfoService {
  getVersion(): string {
    return "V1";
  }

  public async getNodeInfo(nodeId: string) {
    if (!nodeId) {
      throw new ServiceError(400, "node_id is required");
    }

    const rawGenerals = await QuestionDB.aggregate([
      {
        $match: {
          node_id: nodeId,
          type: { $ne: "group" },
          is_archived: false,
        },
      },
      {
        $group: {
          _id: { type: "$type", difficulty: "$difficulty" },
          count: { $sum: 1 },
        },
      },
    ]);

    const generalTypes = ["mcq", "blank-filling"];
    const difficulties = ["easy", "medium", "hard"];
    const generals: GeneralInfo[] = [];

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

    const groupsDocs = await QuestionDB.find(
      { node_id: nodeId, type: "group", is_archived: false },
      { _id: 1, questions_list: 1 }
    ).lean();

    const groups: GroupInfo[] = groupsDocs.map((doc: any) => ({
      id: doc._id.toString(),
      sub_count: Array.isArray(doc.questions_list) ? doc.questions_list.length : 0,
    }));

    return {
      generals,
      groups,
    };
  }

  public async getExamNodeInfo(examId: string): Promise<NodeExamInfo[]> {
    if (!examId) {
      throw new ServiceError(400, "examId is required");
    }

    const exam = await ExamDB.findById(examId).lean();
    if (!exam) {
      throw new ServiceError(404, "Exam not found");
    }

    const nodeInfoList = exam.node_info || [];
    const nodeIds = nodeInfoList.map((n: any) => n.node_id).filter(Boolean);

    const nodes = await TreeNode.find({ _id: { $in: nodeIds } }, { _id: 1, name: 1 }).lean();
    const nodeNameMap = new Map<string, string>();
    nodes.forEach((n: any) => {
      nodeNameMap.set(n._id.toString(), n.name);
    });

    const result: NodeExamInfo[] = nodeInfoList.map((n: any) => ({
      node_id: n.node_id,
      count: n.count,
      name: nodeNameMap.get(n.node_id?.toString()) || "Unknown Node",
    }));

    return result;
  }
}

