import mongoose, { Document, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { Log } from "../types/log";

export interface LogDocument extends Document, Omit<Log, "id"> {}

const logSchema = new Schema<LogDocument>(
  {
    user_id: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, required: true },
    action: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

logSchema.plugin(mongoosePaginate);

export const LogDB = mongoose.model<LogDocument>("Log", logSchema, "Logs");
