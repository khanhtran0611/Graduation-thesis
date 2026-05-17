import { Request, Response } from "express";
import { error, invalidated, notFound, ok } from "../../../utils/responseUtils";
import unitService, { ServiceError, UnitService } from "../service/unit.service";

class UnitController {
  private service: UnitService;

  constructor() {
    this.service = unitService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError) {
      if (err.status === 404) {
        return notFound(res);
      }

      if (err.status === 400) {
        return invalidated(res, { message: err.message });
      }

      return error(res, err.message);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async createUnit(req: Request, res: Response): Promise<Response> {
    try {
      const actor = (req as any).user;
      const data = await this.service.createUnit(req.body, actor);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getAllUnits(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getAllUnits();
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async updateUnit(req: Request, res: Response): Promise<Response> {
    try {
      const actor = (req as any).user;
      const data = await this.service.updateUnit(req.params.id, req.body, actor);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async deleteUnit(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.deleteUnit(req.params.id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async getUnitName(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.getUnitName(req.params.id);
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const unitController = new UnitController();
export default unitController;
