import { isPlainObject, isDate } from './typeGuards';

export const snakeToCamelCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
};

export const camelToSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
};

type Case = 'snake' | 'camel';
type NormalizeKeysConfig = { toCase?: Case };

const caseFormatters: Record<Case, (val: string) => string> = {
  camel: snakeToCamelCase,
  snake: camelToSnakeCase,
};

export const normalizeKeys = <T = Record<string, unknown>>(
  obj: Record<string, unknown>,
  options?: NormalizeKeysConfig
): T => {
  const { toCase = 'camel' } = options ?? {};
  const caseFormatter = caseFormatters[toCase];

  const normalizeObject = (
    input: Record<string, unknown>
  ): Record<string, unknown> => {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const normalizedKey = caseFormatter(key);
      const normalizedValue = isPlainObject(value)
        ? isDate(value)
          ? value
          : normalizeObject(value as Record<string, unknown>)
        : value;
      return { ...acc, [normalizedKey]: normalizedValue };
    }, {});
  };

  return normalizeObject(obj) as T;
};

export const prepareSQLInsertionData = (obj: Record<string, unknown>) => {
  const entries = Object.entries(obj);
  const keys = entries.map((entry) => entry[0]);
  const parameterizedKeys = Array.from(
    { length: keys.length },
    (_, index) => `$${index + 1}`
  );
  const values = entries.map((entry) => entry[1]);

  return {
    keys,
    values,
    parameterizedKeys,
  };
};

export const capitalize = (str: string) => {
  const firstCapitalChar = str[0]?.toLocaleUpperCase() ?? '';
  const restChars = str.substring(1);

  return firstCapitalChar + restChars;
};
