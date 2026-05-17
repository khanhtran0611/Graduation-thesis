import { BaseGenerator } from "../generators/base.generator";
import { QuestionGeneratorRegistry } from "../generators/question.registry";
import {
  EnglishTemplateStrategy,
  SimpleTemplateStrategy,
  TemplateManager,
} from "./template-manager";
import { ExamDataResolver } from "../data-resolve/data-resolver"; // Class đã định nghĩa ở các trao đổi trước
import { ExamDetail2 } from "../../../types/exam";
import { QUESTION_CURRENT_VERSION } from "../generators/base.generator";
import { DocumentOrchestratorInterface } from "./orchestrator_interface";
import { OptionGeneratorRegistry } from "../generators/option.registry";
import { OptionTypeRegistry } from "../generators/option_current_version";

export class DocumentOrchestrator implements DocumentOrchestratorInterface {
  private dataResolver: ExamDataResolver;

  private generatorCache = new Map<string, BaseGenerator<any>>();

  constructor() {
    this.dataResolver = new ExamDataResolver();
  }

  private recursiveFactory = (type: string): BaseGenerator<any> => {
    const versionKey = OptionTypeRegistry[type] || OptionTypeRegistry.mcq;

    // Lúc này 'this' hoạt động hoàn hảo vì là arrow function
    if (this.generatorCache.has(versionKey)) {
      return this.generatorCache.get(versionKey)!;
    }

    const GenClass = OptionGeneratorRegistry[versionKey as keyof typeof OptionGeneratorRegistry];
    if (!GenClass) {
      throw new Error(`OptionGenerator version ${versionKey} not found in registry`);
    }

    const instance = new GenClass();
    this.generatorCache.set(versionKey, instance);
    return instance;
  };

  public async buildLatexCode(
    exam: ExamDetail2,
    mode: string,
    show: number
  ): Promise<{ latexCode: string; images: string[] }> {
    // 1. Phân giải dữ liệu (query DB và bóc tách ảnh)
    const resolvedData = await this.dataResolver.resolve(exam);

    // 2. Sinh mã LaTeX cho phần câu hỏi (sử dụng Registry)
    const QuestionGenClass = QuestionGeneratorRegistry[QUESTION_CURRENT_VERSION];
    if (!QuestionGenClass) {
      throw new Error(`QuestionGenerator version ${QUESTION_CURRENT_VERSION} not found`);
    }

    let questionsLatex = `\\begin{enumerate}\n`;

    resolvedData.orderedQuestions.forEach((question) => {
      const contentGen = this.recursiveFactory("content");
      const optionGen = this.recursiveFactory(question.type);

      // LẮP RÁP: Gọi thằng in Content trước, gọi thằng in Option sau
      questionsLatex += contentGen.generate(question);
      questionsLatex +=
        optionGen.generate(question, {
          mode,
          show,
          option_max_size: question.option_max_size || 4,
          factoryFunc: this.recursiveFactory,
        }) + "\n";
    });

    questionsLatex += `\\end{enumerate}\n`;

    if (mode === "double") {
      questionsLatex = `\\begin{multicols}{2}\n${questionsLatex}\n\\end{multicols}`;
    }

    // 3. Áp dụng Template (Sử dụng Strategy)
    const templateManager = new TemplateManager(new EnglishTemplateStrategy());
    const finalLatex = templateManager.buildDocument({
      title: exam.name,
      code: exam.code,
      duration: exam.duration,
      total: exam.total,
      content: questionsLatex,
    });

    return {
      latexCode: finalLatex,
      images: resolvedData.images,
    };
  }

  public buildQuestionContent(content: string): string {
    const templateManager = new TemplateManager(new SimpleTemplateStrategy());
    return templateManager.buildDocument({
      title: "",
      code: "",
      duration: 0,
      total: 0,
      content,
    });
  }

  public buildOptionLatex(options: any): string {
    const optionGen = this.recursiveFactory("mcq");
    const question = { options };
    const optionLatex = optionGen.generate(question, {
      mode: "single",
      show: 1,
      option_max_size: 46,
      factoryFunc: this.recursiveFactory,
    });

    const templateManager = new TemplateManager(new SimpleTemplateStrategy());
    return templateManager.buildDocument({
      title: "",
      code: "",
      duration: 0,
      total: 0,
      content: optionLatex,
    });
  }
}
