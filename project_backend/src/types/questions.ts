type option = {
  id: string;
  content: string;
  image: string;
  answer_label: string;
  is_correct: boolean;
};

export type Question = {
  id: string;
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string[];
  options: option[];
  questions_list: string[];
  linked: string[];
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
  questions_list: string[];
};

export type linkedQuestionPreview = Pick<Question, "id" | "content">;

export const toOption = (doc: any): option => ({
  // Ưu tiên lấy id có sẵn, nếu không thì lấy _id convert sang string
  id: doc._id?.toString() ?? "",
  content: doc.content,
  image: doc.image ?? "",
  answer_label: doc.answer_label,
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
  questions_list: doc.questions_list ?? [],
  linked: doc.linked ?? [],
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

export const tolinkedQuestionPreview = (doc: any): linkedQuestionPreview => ({
  id: doc._id?.toString(),
  content: doc.content,
});

export type OmittedQuestion = Pick<Question, "id" | "content" | "options" | "type">;
export const toOmittedQuestion = (doc: any): OmittedQuestion => ({
  id: doc._id?.toString(),
  content: doc.content,
  options: doc.options?.map((optionDoc: any) => toOption(optionDoc)) ?? [],
  type: doc.type,
});
