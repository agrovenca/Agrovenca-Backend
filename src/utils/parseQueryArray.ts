export function parseQueryArray<T extends string | number>(
  input: string | string[] | undefined,
  parser: (val: string) => T,
  filterEmpty = true,
): T[] {
  if (typeof input === 'string') {
    const parts = input.split(',').map((val) => val.trim())
    return parts.filter((val) => !filterEmpty || val !== '').map(parser)
  }
  if (Array.isArray(input)) {
    return input.flatMap((item) =>
      item
        .split(',')
        .map((val) => val.trim())
        .filter((val) => !filterEmpty || val !== '')
        .map(parser),
    )
  }
  return []
}
