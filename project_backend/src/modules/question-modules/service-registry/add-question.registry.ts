import { AddQuestionServiceV1 } from "../service/add-question.service";

export const AddServiceRegistry: Record<string, any> = {
  V1: AddQuestionServiceV1,
  // V2: AddQuestionServiceV2
};
