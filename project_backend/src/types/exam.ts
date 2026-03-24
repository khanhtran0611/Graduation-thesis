export type Exam = {
  id: string;
  course_id: string;
  questions_list: (string | string[])[];
  createdAt: Date;
  username: string;
  code: string;
  duration: number;
  name: string;
  total: number;
  total_code: number;
  root_id: string;
};
