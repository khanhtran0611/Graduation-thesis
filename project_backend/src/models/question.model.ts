import mongoose, { Schema, Document } from "mongoose";
import type { SubQuestion } from "../types/questions";

interface Option {
  id: string;
  content: string;
  image: string;
  is_correct: boolean;
}

export interface QuestionDocument extends Document {
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string[];
  options: Option[];
  option_compiled: string;
  option_max_size: number;
  questions_list: SubQuestion[];
  is_archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<Option>({
  content: { type: String, required: false },
  image: { type: String, required: false },
  is_correct: { type: Boolean, required: false },
});

const QuestionSchema = new Schema<QuestionDocument>(
  {
    node_id: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: [String], required: false },
    options: { type: [OptionSchema], required: true },
    option_compiled: { type: String, required: false },
    option_max_size: { type: Number, required: false },
    questions_list: { type: [Object], required: false },
    is_archived: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model<QuestionDocument>("Question", QuestionSchema, "Questions bank");

export default Question;
