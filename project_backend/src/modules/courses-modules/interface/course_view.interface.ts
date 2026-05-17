export interface IGetCourseCards {
  getCourseCards(userId: string): Promise<{ courses: unknown[] }>;
  getRole(): string;
}
