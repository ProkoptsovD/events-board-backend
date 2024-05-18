export const isPlainObject = <T = unknown>(
  value: unknown
): value is Record<string, T> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isDate = (value: unknown): value is Date => {
  return value instanceof Date;
};
