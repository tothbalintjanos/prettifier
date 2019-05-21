# Prettifier

[![CircleCI](https://circleci.com/gh/kevgo/prettifier.svg?style=shield)](https://circleci.com/gh/kevgo/prettifier)

_A GitHub bot that keeps your code base prettier._

Every time someone pushes a commit that contains unformatted code or Markdown to GitHub,
Prettifier adds a commit fixing the formatting issues to the same branch.

## Setup

This bot runs as a Github application.
To set it up for your code base:

- go to https://github.com/apps/prettifier
- click on `Configure`

## Configuration

Prettifier honors `.prettierrc` files in the root of your code base.

You can configured Prettifier via a `.github/prettifier.yml` file in your code base.
The configuration options are:

<a textrun="config-options">

- **excludeFiles:**
  a list of globs that describe files to ignore,
  similar to [.gitignore](https://git-scm.com/docs/gitignore)
- **excludeBranches:**
  a list of branch names to ignore
  </a>

Here is an example configuration file showing the built-in default settings for the bot:

<a textrun="config-example">

```yml
excludeBranches: []
excludeFiles:
  - node_modules
```

</a>
