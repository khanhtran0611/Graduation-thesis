import { OmittedCourse2 } from "./courses";

export interface User {
  id: string;
  name: string;
  "date of birth": string;
  role: string;
  email: string;
  password: string;
  unit_id: string;
  required_change: boolean;
}

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  token_version: number;
  unit_id: string;
}

export type UserDetail = Omit<User, "password">;

export type UserDetail2 = UserDetail & { course_list: OmittedCourse2[] };

export const toUser = (doc: any): User => ({
  id: doc.id ?? doc._id?.toString(),
  name: doc.name,
  "date of birth": doc["date of birth"],
  role: doc.role,
  email: doc.email,
  password: doc.password,
  required_change: doc.required_change,
  unit_id: doc.unit_id,
});

export const toUserDetail = (doc: any): UserDetail => ({
  id: doc.id ?? doc._id?.toString(),
  name: doc.name,
  "date of birth": doc["date of birth"],
  role: doc.role,
  email: doc.email,
  required_change: doc.required_change,
  unit_id: doc.unit_id,
});
