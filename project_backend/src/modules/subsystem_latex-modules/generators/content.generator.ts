import { BaseGenerator } from "./base.generator";

export class QuestionContentGeneratorV1 extends BaseGenerator<any> {
  public getVersion(): string {
    return "content-v1";
  }

  public generate(question: any, extraParams?: Record<string, unknown>): string {
    // Luôn trả về \item (kể cả rỗng) để LaTeX không bị lỗi biên dịch trong môi trường enumerate
    return `\\item ${question.content || ""}\n`;
  }
}
