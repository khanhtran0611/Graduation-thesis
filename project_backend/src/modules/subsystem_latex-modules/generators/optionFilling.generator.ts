import { BaseGenerator } from "./base.generator";

export class OptionFillingGeneratorV1 extends BaseGenerator<any> {
  public generate(question: any, extraParams: Record<string, unknown> = {}): string {
    let content = ""; // Bắt đầu bằng chuỗi rỗng

    const options = question.options || [];
    const show = (extraParams.show as number) ?? 0;

    if (show === 0) {
      content += "\n \\vspace{0.2cm} \n  Answer : \\dotfill \n";
    } else {
      content += `\n \\vspace{0.2cm} \n The result is: ${options[0]?.content ?? ""} \n`;
    }
    return content;
  }

  public getVersion(): string {
    return "filling-v1";
  }
}
