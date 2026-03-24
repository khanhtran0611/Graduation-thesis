export interface User {
  id: string;
  name: string;
  "date of birth": string;
  role: string;
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  name: string;
  email: string;
}

export const toUser = (doc: any): User => ({
  id: doc.id ?? doc._id?.toString(),
  name: doc.name,
  "date of birth": doc["date of birth"],
  role: doc.role,
  email: doc.email,
  password: doc.password,
});
