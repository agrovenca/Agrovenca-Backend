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
