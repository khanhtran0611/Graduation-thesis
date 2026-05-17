import mongoose, { Schema, Document } from "mongoose";
import { Exam } from "../types/exam";

export interface ExamDocument extends Document, Omit<Exam, "id"> {}

const OmittedOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: false, default: "" },
    is_correct: { type: Boolean, required: true },
  },
  { _id: false }
);

const ExamSchema = new Schema<ExamDocument>(
  {
    course_id: { type: String, required: true },
    questions_list: { type: [Object], required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    user_id: { type: String, required: true },
    code: { type: String, required: false },
    duration: { type: Number, required: true },
    name: { type: String, required: true },
    total: { type: Number, required: true },
    total_code: { type: Number, required: false, default: 0 },
    root_id: { type: String, required: false },
    node_info: { type: [Object], required: false, default: [] },
  },
  {
    timestamps: false,
  }
);

export const ExamDB = mongoose.model<ExamDocument>("Exam", ExamSchema, "Exams");
