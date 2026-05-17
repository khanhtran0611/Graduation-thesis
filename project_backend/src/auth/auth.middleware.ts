import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/users";
import jwtToken from "./auth.services";
import redisServices from "./redis.services";
import { forbidden } from "../utils/responseUtils";

class Authorization {
  authenticateToken(req: Request, res: Response, next: NextFunction) {
    const tokenFromCookie = req.cookies.token;
    const token = tokenFromCookie;
    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded: JwtPayload = jwtToken.verifyToken(token);
    if (!decoded) return forbidden(res, "Invalid or expired token");
    (req as any).user = decoded;
    next();
  }

  async authorizeSessionVersion(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    const userId = user?.id;
    const tokenVersion = Number(user?.token_version);

    if (!userId) {
      return forbidden(res, "Unauthorized");
    }

    const redisValue = await redisServices.getValue(userId);

    if (redisValue === null) {
      await redisServices.createItem(userId);
      return next();
    }

    if (redisValue !== tokenVersion) {
      return forbidden(res, "Unauthorized");
    }

    return next();
  }
}

export const authorization = new Authorization();
