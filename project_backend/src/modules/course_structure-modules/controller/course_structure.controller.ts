import { Request, Response } from "express";
import { error as ErrorResponse, invalidated, notFound, ok } from "../../../utils/responseUtils";
import courseStructureService, {
  CourseStructureService,
  ServiceError,
} from "../service/course_structure.service";

class CourseStructureController {
  private service: CourseStructureService;

  constructor() {
    this.service = courseStructureService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof ServiceError) {
      if (error.status === 404) {
        return notFound(res);
      }

      if (error.status === 400) {
        return invalidated(res, { message: error.message });
      }

      return ErrorResponse(res, error.message);
    }

    return ErrorResponse(res, "Server error");
  }

  public async getCourseHierarchy(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getCourseHierarchy(req.params.courseId);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async addTreeNode(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.addTreeNode(req.body);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async updateTreeNode(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.updateTreeNode(req.body);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async deleteTreeNode(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteTreeNode(req.params.id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getTreeNodeById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getTreeNodeById(req.params.id);
      return ok(res, data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

const courseStructureController = new CourseStructureController();
export default courseStructureController;
