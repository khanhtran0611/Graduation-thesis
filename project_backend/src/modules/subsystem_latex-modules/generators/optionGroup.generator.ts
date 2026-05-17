import { OptionGeneratorRegistry } from "./option.registry";
import { BaseGenerator } from "./base.generator";
import { OptionTypeRegistry } from "./option_current_version";

export class OptionGroupGeneratorV1 extends BaseGenerator<any> {
  public getVersion(): string {
    return "group-v1";
  }

  public generate(question: any, extraParams: Record<string, unknown> = {}): string {
    const mode = (extraParams.mode as string) || "single";
    const show = (extraParams.show as number) ?? 0;

    const factoryFunc = extraParams.factoryFunc as (type: string) => BaseGenerator<any>;

    if (!factoryFunc) {
      throw new Error("Missing factoryFunc in extraParams for OptionGroupGeneratorV1");
    }

    let content = `\\begin{enumerate}\n`;

    question.questions_list.forEach((sub: any) => {
      // 1. Lấy thợ in Content cho câu hỏi con
      const contentGen = factoryFunc("content");
      // 2. Lấy thợ in Option cho câu hỏi con
      const subOptionGen = factoryFunc(sub.type);

      // Lắp ráp Content + Option cho câu hỏi con
      content += contentGen.generate(sub);
      content +=
        subOptionGen.generate(sub, {
          mode,
          show,
          option_max_size: sub.option_max_size,
          factoryFunc,
        }) + "\n\n";
    });

    content += `\\end{enumerate}\n`;
    return content;
  }
}
