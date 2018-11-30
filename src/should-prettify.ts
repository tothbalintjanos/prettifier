import ignore from 'ignore'
import prettier from 'prettier'

// The directories that are ignored by default
const IGNORE_BY_DEFAULT = ['node_modules']

// Returns whether the given file is prettifyable based on its type and path
export default async function shouldPrettify(file: string, botConfig) {
  return (
    !isExcluded(file, IGNORE_BY_DEFAULT) &&
    !isExcluded(file, botConfig['exclude-files']) &&
    isPrettifyable(file)
  )
}

// Returns whether the given filename is ignored by the given list of exclusions
function isExcluded(filename, excludes): boolean {
  return ignore()
    .add(excludes)
    .ignores(filename)
}

// Returns whether Prettier thinks it can prettify the given file
async function isPrettifyable(file: string): Promise<boolean> {
  try {
    const result = await prettier.getFileInfo(file)
    return !result.ignored
  } catch (e) {
    return false
  }
}
