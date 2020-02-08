import ignore, { Ignore } from "ignore"
import prettier from "prettier"

/** The Prettifier configuration options and their values. */
interface ConfigOptions {
  commitMessage: string
  excludeBranches: string[]
  excludeFiles: string[]
}

/** Type for user-provided config options (the user doesn't have to provide all options). */
type ConfigParams = Partial<ConfigOptions>

/** Encapsulates logic around configuration of Prettifier. */
export class PrettifierConfiguration {
  /** Default values for the configuration options. */
  static defaults: ConfigOptions = {
    commitMessage: "Format {{commitSha}}",
    excludeBranches: [],
    excludeFiles: ["node_modules"]
  }

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
  constructor(actualConfig: ConfigParams) {
    this.commitMessage = actualConfig.commitMessage || PrettifierConfiguration.defaults.commitMessage
    this.excludeBranches = actualConfig.excludeBranches || PrettifierConfiguration.defaults.excludeBranches
    this.excludeFiles = actualConfig.excludeFiles || PrettifierConfiguration.defaults.excludeFiles
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
