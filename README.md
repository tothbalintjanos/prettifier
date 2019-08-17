# Prettifier

[![CircleCI](https://circleci.com/gh/kevgo/prettifier.svg?style=shield)](https://circleci.com/gh/kevgo/prettifier)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/kevgo/prettifier.svg)](https://lgtm.com/projects/g/kevgo/prettifier/context:javascript)

_A GitHub bot that makes your code base prettier._

Every time someone pushes a commit that contains unformatted code or Markdown to
GitHub, Prettifier adds a commit fixing the formatting issues to the same
branch.

## Setup

This bot runs as a Github application. To set it up for your code base:

- go to https://github.com/apps/prettifier
- click on `Configure`

## Configuration

To configure _Prettier_, put a
[.prettierrc](https://prettier.io/docs/en/configuration.html) file in the root
directory of your code base. To configure the Prettifier bot itself, add a
`.github/prettifier.yml` file to your code base. The configuration options are:

<a textrun="config-options">

- **excludeFiles:** a list of file and directory paths to ignore, similar to
  [.gitignore](https://git-scm.com/docs/gitignore)
- **excludeBranches:** a list of branch names to ignore

</a>

Here is an example configuration file showing the built-in default settings for
the bot:

<a textrun="config-example">

```yml
excludeBranches: []
excludeFiles:
  - node_modules
```

</a>
