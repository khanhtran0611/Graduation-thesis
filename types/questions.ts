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
  createdAt: Date;
  updatedAt: Date;
};
export type QuestionCard = {
  id: string;
  node_id: string;
  type: string;
  difficulty: string;
  content: string;
  image: string;
  questions_list: string[];
  updatedAt: Date;
};

export const toOption = (doc: any): option => ({
  // Ưu tiên lấy id có sẵn, nếu không thì lấy _id convert sang string
  id: doc.id ?? doc._id?.toString() ?? "",
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
  id: doc.id ?? doc._id?.toString(),
  node_id: doc.node_id,
  type: doc.type,
  difficulty: doc.difficulty,
  content: doc.content,
  image: doc.image,
  options: doc.options?.map((optionDoc: any) => toOption(optionDoc)) ?? [],
  questions_list: doc.questions_list ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
export const toQuestionCard = (doc: any): QuestionCard => ({
  id: doc.id ?? doc._id?.toString(),
  node_id: doc.node_id,
  type: doc.type,
  difficulty: doc.difficulty,
  image: doc.image,
  questions_list: doc.questions_list ?? [],
  updatedAt: doc.updatedAt,
  content: doc.content,
});
