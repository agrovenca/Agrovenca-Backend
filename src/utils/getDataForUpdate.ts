export const getDataForUpdate = (data: object) => {
  return Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) acc[key] = value
      return acc
    },
    {} as Record<string, unknown>,
  )
}
