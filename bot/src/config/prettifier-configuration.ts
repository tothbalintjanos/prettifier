import ignore, { Ignore } from "ignore"
import prettier from "prettier"

/** ConfigOptions defines the configuration options that users can provide. */
interface ConfigOptions {
  commentTemplate?: string
  commitMessage?: string
  excludeBranches?: string[] | string
  excludeFiles?: string[] | string
  forkComment?: string
  pullsOnly?: boolean
}

/** PrettifierConfiguration provides the configuration of Prettifier. */
export class PrettifierConfiguration {
  /** template for comments on the pull request */
  commentTemplate: string

  commitMessage: string

  /** names of the branches that should not be prettified */
  excludeBranches: string[]

  /** names of files that should not be prettified */
  excludeFiles: string[]

  /** comment template when pull requests from forks are unformatted */
  forkComment: string

  /** whether to only prettify branches that are under code review */
  pullsOnly: boolean

  /** helps check whether a file path should be ignored */
  ignore: Ignore

  /**
   * Creates a new configuration based on the given config object.
   * Missing values are backfilled with default values.
   */
  constructor(providedConfig: ConfigOptions) {
    this.commentTemplate = providedConfig.commentTemplate ?? ""
    this.commitMessage = providedConfig.commitMessage ?? "Format {{commitSha}}"
    if (Array.isArray(providedConfig.excludeBranches)) {
      this.excludeBranches = providedConfig.excludeBranches
    } else if (!providedConfig.excludeBranches) {
      this.excludeBranches = ["node_modules"]
    } else {
      this.excludeBranches = [providedConfig.excludeBranches]
    }
    if (Array.isArray(providedConfig.excludeFiles)) {
      this.excludeFiles = providedConfig.excludeFiles
    } else if (!providedConfig.excludeFiles) {
      this.excludeFiles = []
    } else {
      this.excludeFiles = [providedConfig.excludeFiles]
    }
    this.forkComment =
      providedConfig.forkComment ??
      `Hey there! :wave: This repository is formatted using [Prettier](https://prettier.io).

These files in your pull request aren't properly formatted:
{{#files}}
- {{.}}
{{/files}}

Please format them using Prettier to conform to this project's code style.
The [Prettier installation guide](https://prettier.io/docs/en/install.html) is a good place to get started with this.
Thanks!!

:heart:

Your friendly [Prettifier](https://prettifier.io) bot
`
    this.ignore = ignore().add(this.excludeFiles)
    this.pullsOnly = providedConfig.pullsOnly ?? false
  }

  /** Indicates whether the given branch should be ignored. */
  shouldIgnoreBranch(branchName: string): boolean {
    return this.excludeBranches.includes(branchName)
  }

  /** Indicates whether the given file should be prettified. */
  async shouldPrettify(filename: string): Promise<boolean> {
    // check whether the filename is listed as ignored
    if (this.ignore.ignores(filename)) {
      return false
    }

    // check whether Prettifier thinks it can handle the file
    const result = await prettier.getFileInfo(filename)
    if (result.ignored) {
      // this somehow always returns false,
      // seems to be influenced by Prettier config
      return false
    }
    if (!result.inferredParser) {
      // whether Prettier has a parser for this file type
      // seems to indicate better whether Prettier can handle the file
      return false
    }
    return true
  }
}
