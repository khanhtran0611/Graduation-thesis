export const MCQ_OPTION_CURRENT_VERSION = "mcq-v1";
export const GROUP_OPTION_CURRENT_VERSION = "group-v1";
export const FILLING_OPTION_CURRENT_VERSION = "filling-v1";
export const CONTENT_GENERATOR_VERSION = "content-v1";

export const OptionTypeRegistry: Record<string, any> = {
  mcq: MCQ_OPTION_CURRENT_VERSION,
  group: GROUP_OPTION_CURRENT_VERSION,
  "blank-filling": FILLING_OPTION_CURRENT_VERSION,
  content: CONTENT_GENERATOR_VERSION,
};
