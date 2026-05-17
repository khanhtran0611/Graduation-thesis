import bcrypt from "bcrypt";
import jwtToken from "../../../auth/auth.services";
import redisServices from "../../../auth/redis.services";
import { UserDB } from "../../../models/user.model";
import { toUserDetail } from "../../../types/users";
import { ServiceError } from "./basic_management.service";

export class SigninService {
  public async login(body: { email: string; password: string; role?: string }) {
    const doc = await UserDB.findOne({ email: body.email }).lean();

    if (!doc) {
      throw new ServiceError(401, "Invalid email or password");
    }

    const passwordMatch = await bcrypt.compare(body.password, doc.password);
    if (!passwordMatch) {
      throw new ServiceError(401, "Invalid email or password");
    }

    if (body.role && doc.role !== body.role) {
      throw new ServiceError(401, "Invalid role");
    }

    const user = toUserDetail(doc);
    let tokenVersion = await redisServices.getValue(user.id);
    if (tokenVersion === null) {
      await redisServices.createItem(user.id);
      tokenVersion = 0;
    }

    const token: string = jwtToken.generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token_version: tokenVersion,
      unit_id: user.unit_id,
    });

    return { user, token };
  }

  public async logout() {
    return { message: "Logged out successfully" };
  }

  public async logoutAll(userId?: string) {
    if (userId) {
      await redisServices.incrementValue(userId);
    }

    return { message: "Logged out all sessions successfully" };
  }
}

const signinService = new SigninService();
export default signinService;
