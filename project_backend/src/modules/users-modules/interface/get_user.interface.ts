export interface IGetUsers {
  getUsers(unitId: string): Promise<{ users: unknown[] }>;
}
