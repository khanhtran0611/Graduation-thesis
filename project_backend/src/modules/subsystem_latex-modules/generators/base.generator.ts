export const QUESTION_CURRENT_VERSION = "v1";
export const OPTION_CURRENT_VERSION = "v1";

export abstract class BaseGenerator<T> {
  public abstract generate(data: T, extraParams?: Record<string, unknown>): string;
  public abstract getVersion(): string;
}

export type GeneratorConstructor<T> = new () => BaseGenerator<T>;
