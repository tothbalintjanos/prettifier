import { Application, Context } from 'probot'
import {
  getBranchName,
  getCommitAuthorName,
  getRepoName,
  getSha,
  iterateCurrentCommitFiles,
  loadFile,
  updateFile
} from 'probot-kit'
import Rollbar from 'rollbar'
import isDifferentText from './is-different-text'
import loadPrettierConfig from './load-prettier-config'
import { PrettifierConfiguration } from './prettifier-configuration'
import prettify from './prettify'

if (process.env.ROLLBAR_ACCESS_TOKEN) {
  new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
  })
}

export = (app: Application) => {
  app.on('push', onPush)
  console.log('PRETTIFIER BOT STARTED')
}

// Called when this bot gets notified about a push on Github
async function onPush(context: Context) {
  if (getSha(context) === '0000000000000000000000000000000000000000') {
    console.log(
      getRepoName(context) +
        '|' +
        getBranchName(context) +
        ': IGNORING BRANCH DELETION'
    )
    return
  }
  const repoName =
    getRepoName(context) +
    '|' +
    getBranchName(context) +
    '|' +
    getSha(context).substring(0, 7)
  console.log(`${repoName}: PUSH DETECTED`)
  if (getCommitAuthorName(context) === 'prettifier[bot]') {
    console.log(`${repoName}: IGNORING COMMIT BY PRETTIFIER`)
    return
  }
  const branchName = getBranchName(context)
  const prettifierConfig = await PrettifierConfiguration.load(context)
  if (prettifierConfig.shouldIgnoreBranch(branchName)) {
    console.log(`${repoName}: IGNORING THIS BRANCH PER BOT CONFIG`)
    return
  }
  const prettierConfig = await loadPrettierConfig(context)
  await iterateCurrentCommitFiles(context, async file => {
    const filePath = `${repoName}|${file.filename}`
    const allowed = await prettifierConfig.shouldPrettify(file.filename)
    if (!allowed) {
      console.log(`${filePath}: NON-PRETTIFYABLE`)
      return
    }
    const [fileContent, sha] = await loadFile(file.filename, context)
    const formatted = prettify(fileContent, file.filename, prettierConfig)
    if (!isDifferentText(formatted, fileContent)) {
      console.log(`${filePath}: ALREADY FORMATTED`)
      return
    }
    try {
      updateFile(file.filename, formatted, sha, context)
      console.log(`${filePath}: PRETTIFYING`)
    } catch (e) {
      console.log(`${filePath}: PRETTIFYING FAILED: ${e.msg}`)
    }
  })
  console.log(`${repoName}: DONE`)
}
