import { Request, Response } from "express";
import crypto from "crypto";
import jwtToken from "../auth/auth.services";
import { UserDB } from "../models/user.model";
import { User, toUserDetail } from "../types/users";
import { UserDocument } from "../models/user.model";
import { toUser } from "../types/users";
import bcrypt from "bcrypt";
import { ok, error, unauthorized, notFound } from "../utils/responseUtils";
import redisServices from "../auth/redis.services";

class UserController {
  async login(req: Request, res: Response) {
    try {
      console.log(req.body);
      const doc = await UserDB.findOne({
        email: req.body["email"],
      }).lean();

      if (!doc) {
        return unauthorized(res, "Invalid email or password");
      }

      const passwordMatch = await bcrypt.compare(req.body["password"], doc.password);
      if (!passwordMatch) {
        return unauthorized(res, "Invalid email or password");
      }

      if (req.body["role"] && doc.role !== req.body["role"]) {
        return unauthorized(res, "Invalid role");
      }

      const user = toUserDetail(doc);
      console.log(user);
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
      // Lưu JWT vào cookie HttpOnly
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return ok(res, user);
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async createAccount(req: Request, res: Response) {
    try {
      const newUser = await UserDB.create({
        name: req.body.name,
        "date of birth": req.body["date of birth"],
        role: req.body.role,
        email: req.body.email,
        password: req.body.password,
      });
      if (newUser === null) {
        return error(res, "Failed to create account");
      }
      const savedUser: UserDocument = await newUser.save();
      return ok(res, { message: "Account created successfully", user: toUser(savedUser) });
    } catch (err) {
      console.log(err);
      return error(res, "Server error");
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const doc = await UserDB.find().lean();
      const users = doc.map(toUser);
      return ok(res, { users });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async getAllUsersNoPassword(req: Request, res: Response) {
    try {
      const doc = await UserDB.find().select("-password").lean();
      const users = doc.map(toUserDetail);
      return ok(res, users);
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async getUserInfo(req: Request, res: Response) {
    try {
      const tokenUserId = (req as any).user?.id;
      const userId = tokenUserId;

      if (!userId) {
        return unauthorized(res, "Missing user id");
      }
      const user = await UserDB.findById(userId).select("-password").lean();
      if (!user) {
        return notFound(res);
      }
      return ok(res, toUserDetail(user));
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async editAccount(req: Request, res: Response) {
    try {
      const updatedData = req.body;
      const id = req.params.id;
      const updatedUser = await UserDB.findByIdAndUpdate(id, updatedData, { new: true });
      return ok(res, toUserDetail(updatedUser));
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deletedUser = await UserDB.findByIdAndDelete(id);

      if (!deletedUser) {
        return notFound(res);
      }

      return ok(res, { message: "Account deleted successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async logout(req: Request, res: Response) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return ok(res, { message: "Logged out successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async logoutAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (userId) {
        await redisServices.incrementValue(userId);
      }
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return ok(res, { message: "Logged out all sessions successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { oldPassword, newPassword } = req.body;

      if (!userId) {
        return unauthorized(res, "Missing user id");
      }

      const user = await UserDB.findById(userId);
      if (!user) {
        return notFound(res);
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return unauthorized(res, "Old password is incorrect");
      }

      user.password = newPassword;
      await user.save();

      return ok(res, { message: "Password changed successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;
      const { password } = req.body;

      const user = await UserDB.findById(userId);
      if (!user) {
        return notFound(res);
      }

      user.password = password;
      user.required_change = false;
      await user.save();

      return ok(res, { message: "Password reset successfully" });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  async resetPassword2(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;

      const user = await UserDB.findById(userId);
      if (!user) {
        return notFound(res);
      }

      const randomPassword = crypto.randomBytes(4).toString("hex");
      user.password = randomPassword;
      user.required_change = true;
      await user.save();

      return ok(res, {
        message: "Password reset successfully",
        password: randomPassword,
      });
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }
}

export const userController = new UserController();
