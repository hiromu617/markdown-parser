export function exists<T>(v: T | null | undefined): v is NonNullable<T> {
  return typeof v !== 'undefined' && v !== null;
}

export function assertExists<T>(
  v: T | null | undefined,
  target = ''
): asserts v is NonNullable<T> {
  if (!exists(v)) {
    throw new Error(`${target} should be specified`.trim());
  }
}
