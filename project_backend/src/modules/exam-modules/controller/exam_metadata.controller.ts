import { Request, Response } from "express";
import { ok } from "../../../utils/responseUtils";
import {
  IGetNodeInfoService,
  ISaveRootExamService,
  SaveRootExamRequestBody,
} from "../interfaces/exam_metadata.interface";
import {
  GET_NODE_INFO_VERSION,
  GetNodeInfoServiceRegistry,
  SAVE_ROOT_EXAM_VERSION,
  SaveRootExamServiceRegistry,
} from "../registry/exam_metadata_registry";
import { ServiceError } from "../service/general_manage.service";

class ExamMetadataController {
  private saveRootExamService: ISaveRootExamService;
  private getNodeInfoService: IGetNodeInfoService;

  constructor() {
    const SaveRootExamService = SaveRootExamServiceRegistry[SAVE_ROOT_EXAM_VERSION];
    const GetNodeInfoService = GetNodeInfoServiceRegistry[GET_NODE_INFO_VERSION];

    if (!SaveRootExamService || !GetNodeInfoService) {
      throw new Error("Exam metadata services not registered");
    }

    this.saveRootExamService = new SaveRootExamService();
    this.getNodeInfoService = new GetNodeInfoService();
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof ServiceError) {
      return res.status(error.status).json(error.body);
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  public async saveRootExam(req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.saveRootExamService.saveRootExam(
        req.body as SaveRootExamRequestBody
      );
      return res.status(201).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getNodeInfo(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.getNodeInfoService.getNodeInfo(req.params.node_id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

const examMetadataController = new ExamMetadataController();
export default examMetadataController;
