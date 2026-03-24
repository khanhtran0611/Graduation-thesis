import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/users";
import dotenv from "dotenv";
dotenv.config();
const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("Missing SECRET_KEY in environment variables");
}

class JwtToken {
  generateToken(payload: JwtPayload): string {
    const token = jwt.sign(payload, SECRET_KEY as string, { expiresIn: "3h" });
    return token;
  }

  verifyToken(token: string): JwtPayload {
    const payload = jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    return payload;
  }
}
export default new JwtToken();
