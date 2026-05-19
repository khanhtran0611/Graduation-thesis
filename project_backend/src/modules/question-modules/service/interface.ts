export interface IAddQuestionService {
  createQuestion(data: any, user: any): Promise<any>;
  getVersion(): String;
}

export interface IUpdateQuestionService {
  updateQuestion(id: string, data: any, user: any): Promise<any>;
  getVersion(): String;
}

export interface IViewQuestionService {
  getQuestionsCards(nodeId: string, mode?: string): Promise<any[]>; // Lấy danh sách card
  getQuestionById(id: string): Promise<any>; // Lấy chi tiết 1 câu hỏi
  getVersion(): String;
}

export interface IDeleteQuestionService {
  deleteOneQuestion(id: string, user: any): Promise<any>;
  deleteManyQuestion(ids: string[], user: any): Promise<any>;
  archiveOneQuestion(id: string): Promise<any>;
  archiveManyQuestions(ids: string[]): Promise<any>;
  restoreOneQuestion(id: string): Promise<any>;
  restoreManyQuestions(ids: string[]): Promise<any>;
  getVersion(): String;
}
