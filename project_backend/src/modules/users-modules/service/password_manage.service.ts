import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserDB } from "../../../models/user.model";
import { ServiceError } from "./basic_management.service";

export class PasswordManageService {
  public async changePassword(
    userId: string | undefined,
    body: { oldPassword: string; newPassword: string }
  ) {
    const { oldPassword, newPassword } = body;

    if (!userId) {
      throw new ServiceError(401, "Missing user id");
    }

    const user = await UserDB.findById(userId);
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new ServiceError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  public async resetPassword(userId: string, body: { password: string }) {
    const { password } = body;

    const user = await UserDB.findById(userId);
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    user.password = password;
    user.required_change = false;
    await user.save();

    return { message: "Password reset successfully" };
  }

  public async resetPassword2(userId: string) {
    const user = await UserDB.findById(userId);
    if (!user) {
      throw new ServiceError(404, "User not found");
    }

    const randomPassword = crypto.randomBytes(4).toString("hex");
    user.password = randomPassword;
    user.required_change = true;
    await user.save();

    return { message: "Password reset successfully", password: randomPassword };
  }
}

const passwordManageService = new PasswordManageService();
export default passwordManageService;
