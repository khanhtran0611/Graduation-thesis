export type CourseCardDisplay = {
  id: string;
  subject_name: string;
  subject_code: string;
};

export type Course = {
  id: string;
  subject_name: string;
  subject_code: string;
  credits: number;
  department: string;
  description: string;
};

export const toCourseCardDisplay = (doc: any): CourseCardDisplay => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
});

export const toCourse = (doc: any): Course => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
  credits: doc.credits,
  department: doc.department,
  description: doc.description,
});
