import mongoose, { Schema, Document } from "mongoose";
import { Exam } from "../types/exam";

export interface ExamDocument extends Document, Omit<Exam, "id"> {}

const ExamSchema = new Schema<ExamDocument>(
  {
    course_id: { type: String, required: true },
    questions_list: { type: [Schema.Types.Mixed], required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    username: { type: String, required: true },
    code: { type: String, required: false },
    duration: { type: Number, required: true },
    name: { type: String, required: true },
    total: { type: Number, required: true },
    total_code: { type: Number, required: false, default: 0 },
    root_id: { type: String, required: false },
  },
  {
    timestamps: false,
  }
);

export const ExamDB = mongoose.model<ExamDocument>("Exam", ExamSchema, "Exams");
