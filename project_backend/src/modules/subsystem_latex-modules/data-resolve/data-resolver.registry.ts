import { MCQDataResolver, GroupDataResolver, FillingDataResolver } from "./data-resolver.concrete";
import { AbstractDataResolver } from "./data-resolver.abstract";

// Các Hằng số Version
export const MCQ_DATA_VERSION = "mcq-data-v1";
export const GROUP_DATA_VERSION = "group-data-v1";
export const FILLING_DATA_VERSION = "filling-data-v1";

// 1. Map từ TYPE -> VERSION
export const DataTypeRegistry: Record<string, string> = {
  mcq: MCQ_DATA_VERSION,
  group: GROUP_DATA_VERSION,
  "blank-filling": FILLING_DATA_VERSION,
};

// 2. Map từ VERSION -> CLASS
export const DataResolverRegistry: Record<string, new () => AbstractDataResolver> = {
  [MCQ_DATA_VERSION]: MCQDataResolver,
  [GROUP_DATA_VERSION]: GroupDataResolver,
  [FILLING_DATA_VERSION]: FillingDataResolver,
};
