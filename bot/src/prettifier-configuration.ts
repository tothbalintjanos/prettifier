import ignore, { Ignore } from "ignore"
import prettier from "prettier"

/** ConfigOptions defines the Prettifier configuration options */
interface ConfigOptions {
  commitMessage: string
  excludeBranches: string[]
  excludeFiles: string[]
}

/** PrettifierConfiguration provides the configuration of Prettifier. */
export class PrettifierConfiguration implements ConfigOptions {
  commitMessage: string

  /** names of the branches that should not be prettified */
  excludeBranches: string[]

  /** names of files that should not be prettified */
  excludeFiles: string[]

  ignore: Ignore

  /**
   * Creates a new configuration based on the given config object.
   * Missing values are backfilled with default values.
   */
  constructor(actualConfig: Partial<ConfigOptions>) {
    this.commitMessage = actualConfig.commitMessage || "Format {{commitSha}}"
    this.excludeBranches = actualConfig.excludeBranches || []
    this.excludeFiles = actualConfig.excludeFiles || ["node_modules"]
    this.ignore = ignore().add(this.excludeFiles)
  }

  /** Indicates whether the given branch should be ignored. */
  shouldIgnoreBranch(branchName: string): boolean {
    return this.excludeBranches.includes(branchName)
  }

  /** Indicates whether the given file should be prettified. */
  async shouldPrettify(filename: string) {
    // check whether the filename is listed as ignored
    if (this.ignore.ignores(filename)) {
      return false
    }

    // check whether Prettifier thinks it can handle the file
    try {
      const result = await prettier.getFileInfo(filename)
      return !result.ignored
    } catch (e) {
      return false
    }
  }
}
