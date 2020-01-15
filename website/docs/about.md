---
id: about
title: About
---

Prettifier is a GitHub bot that keeps your code base consistently formatted in all situations. It does that in a fully
automated so that you can rest assured that your code base is always formatted without having to spend spend further
time and efforts on this topic.

## Unprotected branches

Prettier commits the formatting fixes right into normal (unprotected) branches.

<img src="/img/screenshot_annotated_small.gif" width="547" height="106">

## Protected branches

GitHub allows to
[protect branches](https://help.github.com/en/github/administering-a-repository/about-protected-branches). When this
feature is enabled for a branch, all changes made to this branch have to be tested by your CI server and/or verified via
a code review. This is useful for example to always keep your `master` or `production` branch working.

Since Prettifier cannot commit directly into protected branches, it opens a pull request to submit its fixes for the
protected branch.

<img src="/img/screenshot_pull_request.gif" width="576" height="455">