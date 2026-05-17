import { Request, Response } from "express";
import viewManagementService, { ViewManagementService } from "../service/view_management.service";
import { ServiceError } from "../service/course_basic_manage.service";

class ViewManagementController {
  private service: ViewManagementService;

  constructor() {
    this.service = viewManagementService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof ServiceError) {
      return res.status(error.status).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }

  public async getOmittedCourses(req: Request, res: Response): Promise<Response> {
    try {
      const unitId = req.params.id;
      const data = await this.service.getOmittedCourses(unitId);
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getCoursesForAdmin(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getCoursesForAdmin();
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  public async getCourseCards(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.getCourseCards(userId);
      return res.status(200).json(data);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

const viewManagementController = new ViewManagementController();
export default viewManagementController;
