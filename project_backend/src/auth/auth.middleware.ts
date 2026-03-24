import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/users";
import jwtToken from "./auth.services";

class Authorization {
  authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"]; // Bearer token
    const tokenFromHeader = authHeader && authHeader.split(" ")[1];
    const tokenFromCookie = (req as any).cookies?.token;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded: JwtPayload = jwtToken.verifyToken(token);
    if (!decoded) return res.status(403).json({ message: "Invalid or expired token" });
    (req as any).user = decoded;
    next();
  }
}

export const authorization = new Authorization();
