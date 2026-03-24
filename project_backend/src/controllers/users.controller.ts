import { Request, Response } from "express";
import jwtToken from "../auth/auth.services";
import { UserDB } from "../models/user.model";
import { User } from "../types/users";
import { UserDocument } from "../models/user.model";
import { toUser } from "../types/users";
import bcrypt from "bcrypt";
import { ok, error, unauthorized } from "../utils/responseUtils";

class UserController {
  async login(req: Request, res: Response) {
    // console.log(req.body)
    // res.status(200).json({ message: "Login successful" })
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

      const user = toUser(doc);
      // const token: string = jwtToken.generateToken({
      //   userId: user.id,
      //   name: user.name,
      //   email: user.email,
      // });
      // // Lưu JWT vào cookie HttpOnly
      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: "lax",
      //   maxAge: 3 * 60 * 60 * 1000, // 3 giờ
      // });

      // Có thể vẫn trả token trong body nếu frontend đang dùng
      return ok(res, user);
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }

  // async signup(req: Request, res: Response) {
  //   try {
  //     const newUser = await UserDB.create({
  //       name: req.body.name,
  //       "date of birth": req.body["date of birth"],
  //       role: req.body.role,
  //       email: req.body.email,
  //       password: req.body.password,
  //     });
  //     const savedUser = await newUser.save();
  //     console.log(savedUser);
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ message: "Server error" });
  //   }
  // }

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
      console.log(savedUser);
      return res
        .status(201)
        .json({ message: "Account created successfully", user: toUser(savedUser) });
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

  async editAccount(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updatedData = req.body;
      const id = req.params.id;
      const updatedUser = await UserDB.findByIdAndUpdate(id, updatedData, { new: true });
      return ok(res, { message: "Account updated successfully", user: updatedUser });
      // const updatedUser =
    } catch (err) {
      console.error(err);
      return error(res, "Server error");
    }
  }
}

export const userController = new UserController();
