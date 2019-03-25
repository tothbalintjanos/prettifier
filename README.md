# Prettifier

[![CircleCI](https://circleci.com/gh/kevgo/prettifier.svg?style=shield)](https://circleci.com/gh/kevgo/prettifier)

_A Github bot that automatically formats commits via Prettier._

## Setup

This bot runs as a Github application.
To set it up for your code base:

- go to https://github.com/apps/prettifier
- click on `Configure`

## Configuration

The bot can be configured via a `.github/prettifier.yml` file
in your code base.
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
