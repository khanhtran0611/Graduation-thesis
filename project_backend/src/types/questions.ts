type option = {
  id: string;
  content: string;
  image: string;
  is_correct: boolean;
};

export type SubQuestion = Omit<Question, "questions_list">;

export type Question = {
  id: string;
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string[];
  options: option[];
  option_compiled: string;
  option_max_size: number;
  questions_list: SubQuestion[];
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionCard = {
  id: string;
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string[];
  updatedAt: Date;
  questions_list: SubQuestion[];
};

export const toOption = (doc: any): option => ({
  // Ưu tiên lấy id có sẵn, nếu không thì lấy _id convert sang string
  id: doc._id?.toString() ?? "",
  content: doc.content,
  image: doc.image ?? "",
  is_correct: doc.is_correct,
});

// export const toQuestion = (doc: any): Question => ({
//   id: doc.id ?? doc._id?.toString(),
//   node_id: doc.node_id,
//   type: doc.type,
//   difficulty: doc.difficulty,
//     content: doc.content,

export const toQuestion = (doc: any): Question => ({
  id: doc._id?.toString(),
  node_id: doc.node_id,
  type: doc.type,
  difficulty: doc.difficulty,
  content: doc.content,
  image: doc.image,
  options: doc.options?.map((optionDoc: any) => toOption(optionDoc)) ?? [],
  option_compiled: doc.option_compiled ?? "",
  option_max_size: doc.option_max_size ?? 0,
  questions_list: doc.questions_list ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
export const toQuestionCard = (doc: any): QuestionCard => ({
  id: doc._id?.toString(),
  node_id: doc.node_id,
  type: doc.type,
  difficulty: doc.difficulty,
  image: doc.image,
  updatedAt: doc.updatedAt,
  content: doc.content,
  questions_list: doc.questions_list ?? [],
});

export type OmittedQuestion = Pick<
  Question,
  "id" | "content" | "options" | "type" | "questions_list"
>;
export const toOmittedQuestion = (doc: any): OmittedQuestion => ({
  id: doc._id?.toString(),
  content: doc.content,
  options: doc.options?.map((optionDoc: any) => toOption(optionDoc)) ?? [],
  questions_list: doc.questions_list ?? [],
  type: doc.type,
});

export type OmittedQuestion2 = {
  id: string;
  questions_list: string[];
};

export type SubQuestion3 = Pick<Question, "content" | "options" | "type" | "option_max_size">;

export type OmittedQuestion3 = Pick<
  Question,
  "content" | "options" | "type" | "option_max_size"
> & {
  questions_list: SubQuestion3[];
};
