---
id: configuration
title: Configuration
---

You can customize Prettifier's behavior in a variety of ways.

### Prettier configuration

Add a [.prettierrc](https://prettier.io/docs/en/configuration.html) file to the
root directory of your codebase to customize how your code will get formatted.
The available options are [here](https://prettier.io/docs/en/options.html). Also
see the options to [ignore](https://prettier.io/docs/en/ignore.html) files,
folders, or parts of files.

### Prettifier configuration

To configure the Prettifier bot itself, add a file `.github/prettifier.yml` to
your codebase. The configuration options are:

<a textrun="config-options">

- **commentTemplate:** [text template](#text-templates) for a comment Prettifier
  can add to pull requests when making changes to them. Prettifier adds one
  comment per pull request. Set to an empty string or omit this option to
  disable pull request comments.
- **commitMessage:** [text template](#text-templates) for the commit message of
  formatting fixes
- **excludeFiles:** file and directory paths that you want Prettifier to ignore,
  in a similar format as [.gitignore files](https://git-scm.com/docs/gitignore).
  Please try to use the [Prettier configuration](#prettier-configuration) for
  this before using the setting here.
- **excludeBranches:** branch names that Prettifier should ignore
- **pullsOnly:** when `true`, Prettifier only formats branches ready for review,
  i.e. branches with open pull requests. This makes Prettifier interfere less
  with ongoing development.

</a>

Here is an example configuration file showing the default settings:

<a textrun="config-example">

```yml
commentTemplate: ""
commitMessage: "Format {{commitSha}}"
excludeBranches: []
excludeFiles: []
pullsOnly: false
```

</a>

### Text templates

Text templates can contain text or
[GitHub-flavored Markdown](https://guides.github.com/features/mastering-markdown).
Prettifier replaces these placeholders in them:

- `{{commitSha}}` for the SHA of the prettified commit

### Verifying configuration

Make configuration changes to the Prettier or Prettifier configuration via a
pull request. Prettifier will comment whether the changes work. We call this
GitHubOps!
