import ignore, { Ignore } from "ignore"
import prettier from "prettier"

/** ConfigOptions defines the Prettifier configuration options */
interface ConfigOptions {
  commentTemplate: string
  commitMessage: string
  debug: boolean
  excludeBranches: string[]
  excludeFiles: string[]
  pullsOnly: boolean
}

/** PrettifierConfiguration provides the configuration of Prettifier. */
export class PrettifierConfiguration implements ConfigOptions {
  /** template for comments on the pull request */
  commentTemplate: string

  commitMessage: string

  /** whether to comment user errors on pull requests */
  debug: boolean

  /** names of the branches that should not be prettified */
  excludeBranches: string[]

  /** names of files that should not be prettified */
  excludeFiles: string[]

  /** whether to only prettify branches that are under code review */
  pullsOnly: boolean

  /** helps check whether a file path should be ignored */
  ignore: Ignore

  /**
   * Creates a new configuration based on the given config object.
   * Missing values are backfilled with default values.
   */
  constructor(actualConfig: Partial<ConfigOptions>) {
    this.commentTemplate = actualConfig.commentTemplate ?? ""
    this.commitMessage = actualConfig.commitMessage ?? "Format {{commitSha}}"
    this.debug = actualConfig.debug ?? true
    this.excludeBranches = actualConfig.excludeBranches ?? []
    this.excludeFiles = actualConfig.excludeFiles ?? ["node_modules"]
    this.ignore = ignore().add(this.excludeFiles)
    this.pullsOnly = actualConfig.pullsOnly ?? false
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
