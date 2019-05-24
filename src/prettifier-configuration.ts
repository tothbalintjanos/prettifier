import webhooks from '@octokit/webhooks'
import ignore from 'ignore'
import prettier from 'prettier'
import probot from 'probot'
import probotKit from 'probot-kit'
import { Partial } from './partial-type'

/** The Prettifier configuration options and their values. */
interface ConfigOptions {
  excludeBranches: string[]
  excludeFiles: string[]
}

/** Type for user-provided config options (the user doesn't have to provide all options). */
type ConfigParams = Partial<ConfigOptions>

/** Encapsulates logic around configuration of Prettifier. */
export class PrettifierConfiguration {
  static defaults: ConfigOptions = {
    excludeBranches: [],
    excludeFiles: ['node_modules']
  }

  /** Loads the configuration for the current session from the server. */
  static async load(
    context: probot.Context<webhooks.WebhookPayloadPush>
  ): Promise<PrettifierConfiguration> {
    const actualConfig = await probotKit.loadBotConfig(
      '.github/prettifier.yml',
      context
    )
    return new PrettifierConfiguration(actualConfig)
  }

  /** names of the branches that should not be prettified */
  excludeBranches: string[]

  /** names of files that should not be prettified */
  excludeFiles: string[]

  /**
   * Creates a new configuration based on the given config object.
   * Missing values are backfilled with default values.
   */
  constructor(actualConfig: ConfigParams) {
    this.excludeBranches =
      actualConfig.excludeBranches ||
      PrettifierConfiguration.defaults.excludeBranches
    this.excludeFiles =
      actualConfig.excludeFiles || PrettifierConfiguration.defaults.excludeFiles
  }

  /** Indicates whether the given branch should be ignored. */
  shouldIgnoreBranch(branchName: string): boolean {
    return this.excludeBranches.includes(branchName)
  }

  /** Indicates whether the given file should be prettified. */
  async shouldPrettify(filename: string) {
    // check whether the filename is listed as ignored
    if (
      ignore()
        .add(this.excludeFiles)
        .ignores(filename)
    ) {
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
