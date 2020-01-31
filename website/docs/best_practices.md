---
id: best_practices
title: Best Practices
---

While Prettier will take care of keeping your code formatted, it can only do so
via additional commits after somebody already committed unformatted changes.
When this happens a lot, it can get noisy, especially if these commits end up in
the Git history of your main branches. If Prettifier has to do a lot of
corrections while you are working on code, you two might also run into merge
conflicts.

Below are a few best practices that prevent these issues and make you a better
coder along the way :)

## Configure your editor to format on save

Standardized code formatting is a good thing, and it's best to keep code
prettified at all times so that we all get used to how it looks and feels and
start thinking in formatted code. Most common editors have plugins to run
Prettier each time you save files. Use them. The
[Prettier documentation](https://prettier.io/docs/en/editors.html) provides a
good overview.

## Prettify changes before committing

Code changes made outside of editors, for example using CLI tools, need to be
formatted as well. Run [Prettier](https://prettier.io) before committing these
changes to make them also comply with the formatting guidelines of your project.
This way, code reviewers don't have to look at meaningless whitespace changes
and later commits by other people don't get
[complected](https://en.wiktionary.org/wiki/complect) up with the fixes for
these unrelated formatting issues.

A best practice is to add a script to the toolchain of your project that
corrects all automatically fixable code issues like formatting, certain types of
linter warnings, etc. If you use [npm](https://www.npmjs.com), you could call
this script "npm run fix". If you use Make, it could be "make fix".

## Create a CLI test for external contributions

External contributors might not know about your code formatting guidelines and
might not run Prettifier in their GitHub organization. To help and educate them,
create a dedicated CI test for formatting. Doing so makes it clear the CI test
failed because of a simple formatting issue.

## Squash-merge feature branches

Consider
[squash-merging](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits)
your pull requests. Doing so keeps Prettifier's fixes but eliminates the commits
it made. It also gets rid of other cruft and detours during development.

## Git Town

Finally, minimize merge conflicts by keeping your local Git branches in sync
with their remote counterpart on GitHub by regularly running `git town sync`
from the [Git Town](http://www.git-town.com) toolkit.
