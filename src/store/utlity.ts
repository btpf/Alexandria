// https://levelup.gitconnected.com/typescript-trick-retrieving-all-keys-of-an-object-c346dacf5369
export type GetAllKeys<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | `${GetAllKeys<T[K]>}`
        : never;
    }[keyof T]
  : never;

// https://stackoverflow.com/questions/71187691/recursive-partial-with-depth
type Increment<A extends number[]> = [...A, 0];

export type GetKeysAtLevel<T, Depth extends number = 0, CurrentDepth extends number[] = []> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? CurrentDepth["length"] extends Depth?`${K}`:never | `${GetKeysAtLevel<T[K], Depth, Increment<CurrentDepth>>}`
        : never;
    }[keyof T]
  : never;
