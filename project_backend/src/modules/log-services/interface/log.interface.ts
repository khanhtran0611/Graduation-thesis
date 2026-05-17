export interface getLogI {
  getLog(
    unit_id: string,
    user?: string,
    user_id?: string,
    role?: string,
    actions?: string,
    time?: string,
    page?: number,
    limit?: number
  ): Promise<{
    logs: any[];
    currentPage: number;
    limit: number;
    totalPages: number;
  }>;
}
