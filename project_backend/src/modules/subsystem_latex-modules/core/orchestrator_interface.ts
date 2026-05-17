import { ExamDetail2 } from "../../../types/exam";
export interface DocumentOrchestratorInterface {
  buildLatexCode(
    exam: ExamDetail2,
    mode: string,
    show: number
  ): Promise<{ latexCode: string; images: string[] }>;

  buildQuestionContent(content: string): string;

  buildOptionLatex(options: any): string;
}
