import type { OmittedQuestion3, Question, SubQuestion3, OmittedQuestion2 } from "./questions";

export type Exam = {
  id: string;
  course_id: string;
  questions_list: OmittedQuestion2[];
  createdAt: Date;
  user_id: string;
  node_info: NodeInfo[];
  images: string[];
  code: string;
  duration: number;
  name: string;
  total: number;
  total_code: number;
  root_id: string;
};

export type NodeInfo = {
  node_id: string;
  count: number;
};

export type NodeExamInfo = NodeInfo & { name: string };

export type RootExamSummary = {
  id: string;
  username: string;
  duration: number;
  name: string;
  total: number;
  createdAt: Date;
};

export type ExamDetail = {
  id: string;
  duration: number;
  name: string;
  total: number;
  total_code: number;
  code: string;
  content: string;
};

export type ExamDetail2 = {
  id: string;
  questions_list: OmittedQuestion2[];
  duration: number;
  name: string;
  total: number;
  total_code: number;
  code: string;
};

export interface GeneralInfo {
  type: string;
  difficulty: string;
  count: number;
}

export interface GroupInfo {
  id: string;
  sub_count: number;
}

export interface GroupRequiredInfo {
  count: number;
  sub_count: number;
  type: string;
}

export interface CombinedInfo {
  general_info: GeneralInfo[];
  group_info: GroupInfo[];
  group_required_info: GroupRequiredInfo;
}

export const toRootExamSummary = (doc: any): RootExamSummary => ({
  id: doc.id ?? doc._id?.toString(),
  username: doc.username,
  duration: doc.duration,
  name: doc.name,
  total: doc.total,
  createdAt: doc.createdAt,
});

export function buildOptionsLatexContent(
  options: Question["options"],
  type: string,
  mode: string,
  show: number,
  option_max_size: number
): string {
  let optionsContent = "";

  if (type === "mcq") {
    // Determine number of columns based on mode and option_max_size
    let columns = 1;

    if (mode === "single") {
      if (option_max_size <= 13) {
        columns = 4;
      } else if (option_max_size < 45) {
        columns = 2;
      }
    } else if (mode === "double") {
      if (option_max_size <= 13) {
        columns = 2;
      }
    }

    // Add multicols wrapper if needed
    if (columns > 1) {
      optionsContent +=
        String.raw`\begin{multicols}{` +
        columns +
        String.raw`}
`;
    }

    optionsContent += String.raw`\begin{enumerate}[label=\Alph*., nosep]
`;

    options.forEach((option) => {
      optionsContent += `\\item \\begin{minipage}[t]{\\linewidth}\n`;
      if (show === 1 && option.is_correct) {
        optionsContent += `\\textcolor{red}{${option.content}}\n`;
      } else {
        optionsContent += `${option.content}\n`;
      }

      // If option has image, add image section
      if (option.image) {
        optionsContent += String.raw`
\par
\vspace{0.2cm}
\makebox[\linewidth][c]{\includegraphics[width=0.9\linewidth]{${option.image}}}
\vspace{0.2cm}
`;
      }
      optionsContent += `\\strut\n\\end{minipage}\n\\vspace{0.3cm}\n\n`;
    });
    optionsContent += String.raw`\end{enumerate}`;

    // Close multicols wrapper if used
    if (columns > 1) {
      optionsContent += String.raw`
\end{multicols}`;
    }
    optionsContent += "\n";
  } else if (type === "blank-filling") {
    if (show === 0) {
      optionsContent = "\n \\vspace{0.2cm} \n  Answer : \\dotfill \n";
    } else {
      optionsContent = `
      \\vspace{0.2cm} 
       The result is: ${options[0]?.content ?? ""}
       `;
    }
  }

  return optionsContent;
}

export function buildSubQuestionLatex(
  questionsList: Array<SubQuestion3>,
  mode: string,
  show: number
): string {
  let allContent = String.raw`\begin{enumerate}
`;

  questionsList.forEach((subQuestion) => {
    allContent += `\\item ${subQuestion.content}\n`;

    // Build options latex
    const subType = subQuestion.type;
    const subOptionMaxSize = subQuestion.option_max_size;
    const result = buildOptionsLatexContent(
      subQuestion.options,
      subType,
      mode,
      show,
      subOptionMaxSize
    );
    allContent += result + "\n\n";
  });

  allContent += String.raw`\end{enumerate}`;

  return allContent;
}

export function buildQuestionLatex(
  question: OmittedQuestion3 & { option_max_size?: number },
  mode: string,
  show: number
): string {
  const option_max_size = question.option_max_size || 4;

  if (question.type === "group") {
    return `\\item ${question.content}\n${buildSubQuestionLatex(question.questions_list, mode, show)}\n`;
  } else {
    return `\\item ${question.content}\n${buildOptionsLatexContent(question.options, question.type, mode, show, option_max_size)}\n`;
  }
}

export const LATEX_TEMPLATE_EN = String.raw`\documentclass[12pt,a4paper]{article}
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

% --- EXAM INFORMATION ---
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

% --- STUDENT INFORMATION ---
\noindent
\textbf{Full Name:} \dotfill \\
\textbf{Student ID:} \dotfill

\vspace{0.8cm}

%%QUESTION_CONTENT%%

\end{document}`;

export const LATEX_TEMPLATE_VI = String.raw`\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}   
\usepackage[vietnamese]{babel}  
\usepackage{multicol}
\usepackage{enumitem}
\usepackage{graphicx} 
\usepackage{float}
\usepackage{xcolor}
\usepackage[left=2.0cm, right=2.0cm, top=2.0cm, bottom=2.0cm]{geometry}
\setlist[enumerate,2]{label=\theenumi.\arabic*}
\begin{document}

% --- THÔNG TIN ĐỀ THI ---
\begin{center}
    \textbf{\LARGE %%EXAM TITLE%%} \\
    \vspace{0.4cm}
    \textbf{Mã đề thi:} %%Code%% \hspace{1cm} 
    \textbf{Thời lượng:} %%Minutes%% phút \hspace{1cm} 
    \textbf{Số câu hỏi:} %%Number%% 
\end{center}

\vspace{0.2cm}
\hrule
\vspace{0.5cm}

% --- THÔNG TIN SINH VIÊN ---
\noindent
\textbf{Họ và tên sinh viên:} \dotfill \\
\textbf{Mã số sinh viên (MSSV):} \dotfill

\vspace{0.8cm}

%%QUESTION_CONTENT%%

\end{document}`;
