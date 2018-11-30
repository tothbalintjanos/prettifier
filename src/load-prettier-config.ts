import yml from 'js-yaml'
import { Context } from 'probot'
import { getRepoName, loadFile } from 'probot-kit'

// Loads the .prettierrc file for the code base we are evaluating
export default async function loadPrettierConfig(context: Context) {
  const repoName = getRepoName(context)
  let configText = ''
  try {
    // NOTE: Prettier and TSLint disagree on placing a semicolon on the next line
    // tslint:disable-next-line:whitespace semicolon
    ;[configText] = await loadFile('.prettierrc', context)
  } catch (e) {
    console.log(`${repoName}: NO .prettierrc FOUND`)
    return {}
  }
  try {
    const result = yml.safeLoad(configText)
    console.log(`${repoName}: PRETTIER CONFIG: ${JSON.stringify(result)}`)
    return result
  } catch (e) {
    console.log(`${repoName}: ERROR PARSING .prettierrc:`, e.message)
  }
}
