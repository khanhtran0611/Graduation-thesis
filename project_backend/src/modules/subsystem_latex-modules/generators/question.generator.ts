import { OptionGeneratorRegistry } from "./option.registry";
import { BaseGenerator } from "./base.generator";
import { OptionTypeRegistry } from "./option_current_version";

export class QuestionGeneratorV1 extends BaseGenerator<any> {
  public getVersion(): string {
    return "v1";
  }

  public generate(question: any, extraParams: Record<string, unknown> = {}): string {
    const mode = (extraParams.mode as string) || "single";
    const show = (extraParams.show as number) ?? 0;

    if (question.type === "group") {
      let content = `\\item ${question.content}\n\\begin{enumerate}\n`;

      question.questions_list.forEach((sub: any) => {
        content += `\\item ${sub.content}\n`;

        const versionKey = OptionTypeRegistry[sub.type] || OptionTypeRegistry.mcq;
        const OptionGenClass =
          OptionGeneratorRegistry[versionKey as keyof typeof OptionGeneratorRegistry];

        if (!OptionGenClass) {
          throw new Error(`OptionGenerator version ${versionKey} not found in registry`);
        }

        // Khai báo theo BaseGenerator, khởi tạo qua Registry
        const optionGen: BaseGenerator<any[]> = new OptionGenClass();

        content +=
          optionGen.generate(sub.options || [], {
            type: sub.type,
            option_max_size: sub.option_max_size,
            mode,
            show,
          }) + "\n\n";
      });
      content += `\\end{enumerate}\n`;
      return content;
    } else {
      let content = `\\item ${question.content}\n`;

      const versionKey = OptionTypeRegistry[question.type] || OptionTypeRegistry.mcq;
      const OptionGenClass =
        OptionGeneratorRegistry[versionKey as keyof typeof OptionGeneratorRegistry];

      if (!OptionGenClass) {
        throw new Error(`OptionGenerator version ${versionKey} not found in registry`);
      }

      // Khai báo theo BaseGenerator, khởi tạo qua Registry
      const optionGen: BaseGenerator<any[]> = new OptionGenClass();

      content +=
        optionGen.generate(question.options || [], {
          type: question.type,
          option_max_size: question.option_max_size || 4,
          mode,
          show,
        }) + "\n";
      return content;
    }
  }
}
