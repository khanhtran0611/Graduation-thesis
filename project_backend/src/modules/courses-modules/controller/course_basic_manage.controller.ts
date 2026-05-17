import { Request, Response } from "express";
import courseBasicManageService, {
  CourseBasicManageService,
  ServiceError,
} from "../service/course_basic_manage.service";

class CourseBasicManageController {
  private service: CourseBasicManageService;

  constructor() {
    this.service = courseBasicManageService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  public async getCourseById(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getCourseById(req.params.id);
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async createCourse(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.createCourse(req.body);
      return res.status(201).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async updateCourse(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.updateCourse(req.params.id, req.body);
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async deleteCourse(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteCourse(req.params.id);
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

const courseBasicManageController = new CourseBasicManageController();
export default courseBasicManageController;
