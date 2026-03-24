import mongoose, { Schema, Document } from "mongoose";

export interface CourseDocument extends Document {
  subject_name: string;
  subject_code: string;
  credits: number;
  department: string;
  description: string;
}

const courseSchema = new Schema<CourseDocument>({
  subject_name: { type: String, required: true },
  subject_code: { type: String, required: true },
  credits: { type: Number, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
});

export const CourseDB = mongoose.model<CourseDocument>("Course", courseSchema);
