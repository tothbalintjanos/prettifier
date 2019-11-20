import prettier from "prettier"

/** Formats the given content for the given file using the given Prettier configuration. */
export function prettify(text: string, filename: string, prettierConfig: prettier.Options) {
  const options = { ...prettierConfig }
  options.filepath = filename
  try {
    return prettier.format(text, options)
  } catch (e) {
    return text
  }
}
