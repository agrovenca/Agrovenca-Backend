export function pluralize(
  text: string,
  value: string | number | object,
  pluralSuffix: string,
  singularSuffix = '',
) {
  let count: number

  if (typeof value === 'number') {
    count = value
  } else if (typeof value === 'string' && !isNaN(Number(value))) {
    count = Number(value)
  } else if (Array.isArray(value)) {
    count = value.length
  } else if (value && typeof value === 'object') {
    count = Object.keys(value).length
  } else {
    count = 0
  }

  const suffix = count === 1 ? singularSuffix : pluralSuffix
  return ` ${text}${suffix} `
}
