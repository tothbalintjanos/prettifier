---
id: configuration
title: Configuration
---

Many behaviors of Prettifier are configurable.

### Prettier configuration

Add a [.prettierrc](https://prettier.io/docs/en/configuration.html) file to the
root directory of your code base to customize how your code will get formatted.

### Prettifier configuration

To configure the Prettifier bot itself, add a file `.github/prettifier.yml` to
your code base. The configuration options are:

<a textrun="config-options">

- **commitMessage:** message template for the prettification commits. Possible
  placeholders are:
  - `{{commitSha}}` for the SHA of the prettified commit
- **excludeFiles:** a list of file and directory paths to ignore, similar to
  [.gitignore](https://git-scm.com/docs/gitignore)
- **excludeBranches:** a list of branch names to ignore
- **pullsOnly:** when set to `true`, Prettifier only formats branches that are
  ready for review, i.e. have open pull requests. This limits interference of
  Prettifier into ongoing development.

</a>

Here is an example configuration file showing the default settings:

<a textrun="config-example">

```yml
commitMessage: "Format {{commitSha}}",
excludeBranches: []
excludeFiles:
  - node_modules
pullsOnly: false
```

</a>
