import prettier from 'prettier'

/** Formats the given content for the given file using the given Prettier configuration. */
export function prettify(text: string, filename: string, config) {
  const options = { filepath: filename }
  const merged = { ...config, ...options }
  try {
    return prettier.format(text, merged)
  } catch (e) {
    return text
  }
}
