import mongoose, { Schema, Document } from "mongoose";

interface Option {
  id: string;
  content: string;
  image: string;
  answer_label: string;
  is_correct: boolean;
}

export interface QuestionDocument extends Document {
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string[];
  options: Option[];
  questions_list: string[];
  linked: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<Option>({
  content: { type: String, required: false },
  image: { type: String, required: false },
  answer_label: { type: String, required: false },
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
    questions_list: { type: [String], required: false },
    linked: { type: [String], required: false },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model<QuestionDocument>("Question", QuestionSchema, "Questions bank");

export default Question;
