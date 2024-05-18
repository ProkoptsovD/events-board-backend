type RemoveUnderscoreFirstLetter<S extends string> =
  S extends `${infer FirstLetter}${infer U}`
    ? `${FirstLetter extends '_' ? U : `${FirstLetter}${U}`}`
    : S;

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${RemoveUnderscoreFirstLetter<
      Lowercase<T>
    >}${CamelToSnakeCase<U>}`
  : S;

type Capitalize<S extends string> = S extends `${infer First}${infer Rest}`
  ? `${Uppercase<First>}${Rest}`
  : S;

type SnakeToCamelCase<S extends string> =
  S extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}${Capitalize<Rest>}`
    : Lowercase<S>;

export type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<K & string>]: T[K];
};

export type KeysToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<K & string>]: T[K];
};
