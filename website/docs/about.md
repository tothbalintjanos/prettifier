---
id: about
title: About
---

Prettifier is a GitHub bot that keeps your codebase consistently formatted using
[Prettier](https://prettier.io) in all situations. It works fully automatically.
Every time someone pushes a commit that contains unformatted content to GitHub,
Prettifier fixes it.

## Unprotected branches

Prettier commits the formatting fixes right into normal (unprotected) branches.

<img src="/img/screenshot_annotated_small.gif" width="547" height="106">

## Protected branches

GitHub allows to
[protect branches](https://help.github.com/en/github/administering-a-repository/about-protected-branches).
When this feature is enabled for a branch, all changes made to this branch have
to be tested by your CI server and/or verified via a code review. This is useful
for example to always keep your `master` or `production` branch working.

Since Prettifier cannot commit directly into protected branches, it opens a pull
request to submit its fixes for the protected branch.

<img src="/img/screenshot_pull_request.gif" width="576" height="455">
