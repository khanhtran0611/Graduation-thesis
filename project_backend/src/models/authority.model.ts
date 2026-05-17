import mongoose, { Document, Schema } from "mongoose";
import { Authority } from "../types/authority";

export interface AuthorityDocument extends Document, Omit<Authority, "id"> {}

const omittedCourseSchema = new Schema(
  {
    id: { type: String, required: true },
    subject_name: { type: String, required: true },
    subject_code: { type: String, required: true },
    access: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const authoritySchema = new Schema<AuthorityDocument>(
  {
    course_list: { type: [omittedCourseSchema], required: true, default: [] },
    user_id: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AuthorityDB = mongoose.model<AuthorityDocument>(
  "Authority",
  authoritySchema,
  "Authorities"
);
