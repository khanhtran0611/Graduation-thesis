import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { LogAdmin } from "../types/log";

export interface LogAdminDocument extends Document, Omit<LogAdmin, "id"> {}

const logAdminSchema = new Schema<LogAdminDocument>(
  {
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
    unit_id: { type: String, required: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

logAdminSchema.plugin(mongoosePaginate);

export const AdminLogDB = mongoose.model<LogAdminDocument>("AdminLog", logAdminSchema, "AdminLogs");
