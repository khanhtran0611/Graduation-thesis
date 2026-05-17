export type Log = {
  id: string;
  user_id: string;
  username: string;
  role: string;
  action: string;
  createdAt: Date;
};

export type LogAdmin = {
  id: string;
  user_id: string;
  username: string;
  role: string;
  action: string;
  unit_id?: string;
  createdAt: Date;
};

export const toLog = (doc: any): Log => ({
  id: doc.id ?? doc._id?.toString(),
  user_id: doc.user_id,
  username: doc.username,
  role: doc.role,
  action: doc.action,
  createdAt: doc.createdAt,
});

export const toLogAdmin = (doc: any): LogAdmin => ({
  id: doc.id ?? doc._id?.toString(),
  user_id: doc.user_id,
  username: doc.username,
  role: doc.role,
  action: doc.action,
  unit_id: doc.unit_id ?? "",
  createdAt: doc.createdAt,
});
