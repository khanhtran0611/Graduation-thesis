import { ParserState } from "../service/parser.service";
import {Question} from "../../../types/questions";

export const createEmptyQuestion = (): Partial<Question> => ({
  content: '',
  options: [],
  questions_list: [],
  is_archived: false
});

// Xử lý Đáp án & Chốt Type
export const processAnswer = (line: string, question: Partial<Question>, lineNum: number): void => {
  const answerVal = line.replace(/^[Aa][Nn][Ss][Ww][Ee][Rr]:\s*/, '').trim();

  if (question.options!.length === 0) {
    question.type = 'blank-filling'; //
    question.options = [{ id: "", content: answerVal, is_correct: true, image: "" }];
  } else {
    question.type = 'mcq'; //
    const correctIndex = answerVal.toUpperCase().charCodeAt(0) - 65;

    if (!question.options![correctIndex]) {
      throw new Error(`Data Error at line ${lineNum}: The answer key '${answerVal}' does not match any provided choices.`);
    }
    question.options![correctIndex].is_correct = true;
  }
};

// Xử lý Option & Check lỗi State
export const processOption = (line: string, question: Partial<Question>, lineNum: number, state: ParserState): void => {
  if (state !== 'READING_CONTENT' && state !== 'READING_OPTION') {
    throw new Error(`Syntax Error at line ${lineNum}: Unexpected option format. Choices cannot appear here.`);
  }
  
  question.options!.push({
    id: "",
    content: line.replace(/^[A-Z]\.\s*/, ''),
    is_correct: false,
    image: ""
  });
};

// Xử lý Diff & Check lỗi State
export const processDifficulty = (line: string, question: Partial<Question>, lineNum: number, state: ParserState): void => {
  if (state !== 'DIFF') {
    throw new Error(`Syntax Error at line ${lineNum}: Unexpected 'DIFF:'. It must strictly follow an 'ANSWER:' line.`);
  }
  question.difficulty = line.replace(/^[Dd][Ii][Ff][Ff]:\s*/, '').trim().toLowerCase();
};

// Xử lý Content & Check lỗi lọt text lạ
export const processContent = (line: string, question: Partial<Question>, lineNum: number, state: ParserState): void => {
  if (state === 'READING_CONTENT') {
    question.content = question.content ? `${question.content}\n${line}` : line;
  } else {
    const expected = state === 'READING_OPTION' ? "an option line (e.g., 'E.') or 'ANSWER:'" : "'DIFF:'";
    throw new Error(`Syntax Error at line ${lineNum}: Invalid text '${line}'. Expected ${expected}.`);
  }
};