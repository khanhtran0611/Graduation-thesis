import { IGetNodeInfoService, ISaveRootExamService } from "../interfaces/exam_metadata.interface";
import { GetNodeInfoServiceV1 } from "../service/get-node-info.service";
import { SaveRootExamServiceV1 } from "../service/save-root-exam.service";

export const SAVE_ROOT_EXAM_VERSION = "V1";
export const GET_NODE_INFO_VERSION = "V1";

export const SaveRootExamServiceRegistry: Record<string, new () => ISaveRootExamService> = {
  V1: SaveRootExamServiceV1,
};

export const GetNodeInfoServiceRegistry: Record<string, new () => IGetNodeInfoService> = {
  V1: GetNodeInfoServiceV1,
};
