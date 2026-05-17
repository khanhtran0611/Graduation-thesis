import { OptionGeneratorV1 } from "./option.generator";
import { MCQOptionGeneratorV1 } from "./optionMcq.generator";
import { OptionFillingGeneratorV1 } from "./optionFilling.generator";
import { OptionGroupGeneratorV1 } from "./optionGroup.generator";
import { QuestionContentGeneratorV1 } from "./content.generator";

export const OptionGeneratorRegistry = {
  v1: OptionGeneratorV1,
  "mcq-v1": MCQOptionGeneratorV1,
  "filling-v1": OptionFillingGeneratorV1,
  "group-v1": OptionGroupGeneratorV1,
  "content-v1": QuestionContentGeneratorV1,
};
