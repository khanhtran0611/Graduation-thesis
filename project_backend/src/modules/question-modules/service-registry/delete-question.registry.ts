import { DeleteQuestionServiceV1 } from "../service/delete-question.service";

export const DeleteServiceRegistry: Record<string, any> = {
  V1: DeleteQuestionServiceV1,
};
