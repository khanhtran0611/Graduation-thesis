export type OmittedCourse = {
  id: string;
  subject_name: string;
  subject_code: string;
};

export type Course = {
  id: string;
  subject_name: string;
  subject_code: string;
  credits: number;
  unit_id: string;
  description: string;
};

export type CourseInfo = {
  id: string;
  subject_name: string;
  subject_code: string;
  credits: number;
  unit_name: string;
  description: string;
};

export const toCourseInfo = (doc: any): CourseInfo => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
  credits: doc.credits,
  unit_name: doc.unit_name,
  description: doc.description,
});

export type OmittedCourse2 = {
  id: string;
  subject_name: string;
  subject_code: string;
  access: boolean;
};

export const toOmittedCourse = (doc: any): OmittedCourse => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
});

export const toCourse = (doc: any): Course => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
  credits: doc.credits,
  unit_id: doc.unit_id,
  description: doc.description,
});

export const toOmittedCourse2 = (doc: any): OmittedCourse2 => ({
  id: doc.id ?? doc._id?.toString(),
  subject_name: doc.subject_name,
  subject_code: doc.subject_code,
  access: doc.access ?? false,
});
