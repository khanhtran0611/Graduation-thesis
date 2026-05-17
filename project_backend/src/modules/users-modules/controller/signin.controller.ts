import { Request, Response } from "express";
import { error, ok, unauthorized } from "../../../utils/responseUtils";
import signinService, { SigninService } from "../service/signin.service";
import { ServiceError } from "../service/basic_management.service";

class SigninController {
  private service: SigninService;

  constructor() {
    this.service = signinService;
  }

  private handleError(res: Response, err: unknown): Response {
    if (err instanceof ServiceError && err.status === 401) {
      return unauthorized(res, err.message);
    }

    console.error(err);
    return error(res, "Server error");
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { user, token } = await this.service.login(req.body);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return ok(res, user);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async logout(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.service.logout();
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  public async logoutAll(req: Request, res: Response): Promise<Response> {
    try {
      const userId = (req as any).user?.id;
      const data = await this.service.logoutAll(userId);
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return ok(res, data);
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

const signinController = new SigninController();
export default signinController;
