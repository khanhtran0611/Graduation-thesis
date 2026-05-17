export interface ExamTemplateData {
  title: string;
  code: string;
  duration: number;
  total: number;
  content: string;
}

export interface TemplateStrategy {
  fill(data: ExamTemplateData): string;
}

export class EnglishTemplateStrategy implements TemplateStrategy {
  private readonly templateEn = String.raw`\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}   
\usepackage[vietnamese]{babel}  
\usepackage{multicol}
\usepackage{enumitem}
\usepackage{graphicx} 
\usepackage{xcolor}
\usepackage{float}
\usepackage[left=2.0cm, right=2.0cm, top=2.0cm, bottom=2.0cm]{geometry}
\setlist[enumerate,2]{label=\theenumi.\arabic*}
\begin{document}

\begin{center}
    \textbf{\LARGE %%EXAM TITLE%%} \\
    \vspace{0.4cm}
    \textbf{Exam Code:} %%Code%% \hspace{1cm} 
    \textbf{Duration:} %%Minutes%% mins \hspace{1cm} 
    \textbf{Total Questions:} %%Number%%
\end{center}

\vspace{0.2cm}
\hrule
\vspace{0.5cm}

\noindent
\textbf{Full Name:} \dotfill \\
\textbf{Student ID:} \dotfill

\vspace{0.8cm}

%%QUESTION_CONTENT%%

\end{document}`;

  public fill(data: ExamTemplateData): string {
    return this.templateEn
      .replace("%%EXAM TITLE%%", data.title)
      .replace("%%Code%%", data.code)
      .replace("%%Minutes%%", String(data.duration))
      .replace("%%Number%%", String(data.total))
      .replace("%%QUESTION_CONTENT%%", data.content);
  }
}

export class SimpleTemplateStrategy implements TemplateStrategy {
  private readonly template = String.raw`\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[vietnamese]{babel}
\usepackage{multicol}
\usepackage{enumitem}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{float}
\usepackage[left=2.0cm, right=2.0cm, top=2.0cm, bottom=2.0cm]{geometry}
\setlist[enumerate,2]{label=\theenumi.\arabic*}
\begin{document}

%%QUESTION_CONTENT%%

\end{document}`;

  public fill(data: ExamTemplateData): string {
    return this.template.replace("%%QUESTION_CONTENT%%", data.content);
  }
}

export class TemplateManager {
  private strategy: TemplateStrategy;

  constructor(strategy: TemplateStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: TemplateStrategy): void {
    this.strategy = strategy;
  }

  public buildDocument(data: ExamTemplateData): string {
    return this.strategy.fill(data);
  }
}
