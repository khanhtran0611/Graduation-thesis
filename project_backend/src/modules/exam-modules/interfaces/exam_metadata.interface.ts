import { CombinedInfo, GeneralInfo, GroupInfo } from "../../../types/exam";

export type SaveRootExamRequestBody = {
  course_id: string;
  duration: number;
  name: string;
  user_id: string;
  total: number;
  questionMap: Record<string, CombinedInfo>;
};

export interface ISaveRootExamService {
  getVersion(): string;
  saveRootExam(body: SaveRootExamRequestBody): Promise<{ message: string; data: unknown }>;
}

export interface IGetNodeInfoService {
  getVersion(): string;
  getNodeInfo(nodeId: string): Promise<{ generals: GeneralInfo[]; groups: GroupInfo[] }>;
}
