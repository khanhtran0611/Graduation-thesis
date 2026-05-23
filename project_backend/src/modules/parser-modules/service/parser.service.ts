import {Question} from "../../../types/questions";
import { createEmptyQuestion, processAnswer, processOption, processDifficulty, processContent } from "../helper/parser.helper";


export type ParserState = 'READING_CONTENT' | 'READING_OPTION' | 'DIFF';

export interface ParseResult {
  success: boolean;
  data?: any[];
  error?: string;
}




export function parseAikenStateMachine(fileContent: string): ParseResult {
  const lines = fileContent.split('\n').map(line => line.trim());
  const questions: Partial<Question>[] = [];
  
  let state: ParserState = 'READING_CONTENT';
  let currentQuestion = createEmptyQuestion();

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const lowerLine = line.toLowerCase();
      const lineNum = i + 1;

      // ==========================================
      // 1. TRIGGER: DÒNG ĐỘ KHÓ
      // ==========================================
      if (lowerLine.startsWith('diff:')) {
        processDifficulty(line, currentQuestion, lineNum, state);

        if (currentQuestion.type === 'mcq' && currentQuestion.options) {
          currentQuestion.option_max_size = Math.max(...currentQuestion.options.map(opt => opt.content?.length || 0));
        }

        questions.push({ ...currentQuestion }); 

        currentQuestion = createEmptyQuestion();
        state = 'READING_CONTENT';
        continue;
      }

      // ==========================================
      // 2. TRIGGER: DÒNG ĐÁP ÁN 
      // ==========================================
      if (lowerLine.startsWith('answer:')) {
        processAnswer(line, currentQuestion, lineNum);
        state = 'DIFF'; // Ép state
        continue;
      }

      // ==========================================
      // 3. TRIGGER: DÒNG OPTION
      // ==========================================
      if (line.match(/^[A-Z]\./)) {
        processOption(line, currentQuestion, lineNum, state);
        state = 'READING_OPTION'; // Ép state
        continue;
      }

      // ==========================================
      // 4. XỬ LÝ TEXT THƯỜNG / TEXT RÁC
      // ==========================================
      processContent(line, currentQuestion, lineNum, state);
    }

    // Check đứt gãy cuối file
    if (state === 'DIFF') {
      throw new Error(`Syntax Error: End of file reached unexpectedly. Missing the final 'DIFF:' line.`);
    }

    return { success: true, data: questions };

  } catch (error: any) {
    // Tóm toàn bộ lỗi throw từ các file Helper
    return { success: false, error: error.message };
  }
}
