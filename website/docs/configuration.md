---
id: configuration
title: Configuration
---

Prettifier allows to configure many aspects of it using configuration files. To

### Prettier configuration

To configure _Prettier_ (the open-source tools that Prettifier uses internally to format source code), put a
[.prettierrc](https://prettier.io/docs/en/configuration.html) file in the root directory of your code base.

### Prettifier

To configure the Prettifier bot itself, add a `.github/prettifier.yml` file to your code base. The configuration options
are:

<a textrun="config-options">

- **commitMessage:** the message for the prettification commits. Possible placeholders are:
  - `{{commitSha}}` for the SHA of the prettified commit
- **excludeFiles:** a list of file and directory paths to ignore, similar to
  [.gitignore](https://git-scm.com/docs/gitignore)
- **excludeBranches:** a list of branch names to ignore
- **pullsOnly:** when `true`, prettifies only branches that have open pull requests

</a>

Here is an example configuration file showing the built-in default settings for the bot:

<a textrun="config-example">

```yml
commitMessage: "Format {{commitSha}}",
excludeBranches: []
excludeFiles:
  - node_modules
pullsOnly: false
```

</a>
