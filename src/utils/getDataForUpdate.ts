/**
 * Returns a new object containing only the properties from the input `data` object
 * whose values are not `undefined`, or whose keys are included in the `keysExcept` array.
 *
 * @param data - The source object to filter.
 * @param keysExcept - An array of keys to always include in the result, even if their values are `undefined`.
 * @returns A new object with filtered properties suitable for update operations.
 */
export const getDataForUpdate = (data: object, keysExcept: string[] = []) => {
  return Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined || keysExcept.includes(key)) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, unknown>,
  )
}
