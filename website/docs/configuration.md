---
id: configuration
title: Configuration
---

Prettifier's behavior can be customized in a variety of ways.

### Prettier configuration

Add a [.prettierrc](https://prettier.io/docs/en/configuration.html) file to the
root directory of your codebase to customize how your code will get formatted.

### Prettifier configuration

To configure the Prettifier bot itself, add a file `.github/prettifier.yml` to
your codebase. The configuration options are:

<a textrun="config-options">

- **commentTemplate:** [text template](#text-templates) for a comment Prettifier
  can add to pull requests when making changes to them. Prettifier adds only one
  comment per pull request. Set to an empty string or omit this option to
  disable pull request comments.
- **commitMessage:** [text template](#text-templates) for the commit message of
  formatting fixes
- **excludeFiles:** file and directory paths to ignore, in a similar format as
  [.gitignore files](https://git-scm.com/docs/gitignore)
- **excludeBranches:** branch names that Prettifier should ignore
- **pullsOnly:** when `true`, Prettifier only formats branches ready for review,
  i.e. ones that have open pull requests. This makes Prettifier interfere less
  with ongoing development.

</a>

Here is an example configuration file showing the default settings:

<a textrun="config-example">

```yml
commentTemplate: ""
commitMessage: "Format {{commitSha}}"
excludeBranches: []
excludeFiles:
  - node_modules
pullsOnly: false
```

</a>

### Text templates

Text templates can contain text or
[GitHub-flavored Markdown](https://guides.github.com/features/mastering-markdown).
Prettifier replaces these placeholders in them:

- `{{commitSha}}` for the SHA of the prettified commit

### Verifying configuration

It is recommended to make configuration changes to the Prettier or Prettifier
configuration via a pull request. Prettifier will review them and comment
whether they work. We call this GitHubOps.
