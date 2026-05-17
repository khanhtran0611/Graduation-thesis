import { BaseGenerator } from "./base.generator";

export class OptionGeneratorV1 extends BaseGenerator<any[]> {
  public generate(options: any[], extraParams: Record<string, unknown> = {}): string {
    const type = (extraParams.type as string) || "mcq";
    const optionMaxSize = (extraParams.option_max_size as number) || 4;
    const mode = (extraParams.mode as string) || "single";
    const show = (extraParams.show as number) ?? 0;

    if (type === "blank-filling") {
      if (show === 0) {
        return "\n \\vspace{0.2cm} \n  Answer : \\dotfill \n";
      } else {
        return `\n \\vspace{0.2cm} \n The result is: ${options[0]?.content ?? ""} \n`;
      }
    }

    if (type === "mcq") {
      let columns = 1;
      if (mode === "single") {
        if (optionMaxSize <= 13) columns = 4;
        else if (optionMaxSize < 45) columns = 2;
      } else if (mode === "double") {
        if (optionMaxSize <= 13) columns = 2;
      }

      let content = "";
      if (columns > 1) content += `\\begin{multicols}{${columns}}\n`;
      content += `\\begin{enumerate}[label=\\Alph*., nosep]\n`;

      options.forEach((opt) => {
        content += `\\item \\begin{minipage}[t]{\\linewidth}\n`;
        content +=
          show === 1 && opt.is_correct ? `\\textcolor{red}{${opt.content}}\n` : `${opt.content}\n`;
        if (opt.image) {
          content += `\n\\par\n\\vspace{0.2cm}\n\\makebox[\\linewidth][c]{\\includegraphics[width=0.9\\linewidth]{${opt.image}}}\n\\vspace{0.2cm}\n`;
        }
        content += `\\strut\n\\end{minipage}\n\\vspace{0.3cm}\n\n`;
      });

      content += `\\end{enumerate}\n`;
      if (columns > 1) content += `\\end{multicols}\n`;
      return content;
    }
    return "";
  }
  public getVersion(): string {
    return "v1";
  }
}
