---
id: best_practices
title: Best Practices
---

Prettifier is best used to correct formatting issues in edge cases. If you make Prettifier do all the formatting all the
time, it will end up interfering with ongoing development. Here are a some best practices for good human-prettifier
coexistence :)

## Configure your editor to format on save

Keep code prettified at all times so that we get used to how it looks and feels and start thinking in formatted code.
Most common editors have plugins to run Prettier each time you save files. The
[Prettier documentation](https://prettier.io/docs/en/editors.html) provides a good list.

## Prettify changes before committing

Code changes made outside of editors, for example using CLI tools, should also be formatted. Run the
[Prettier](https://prettier.io) CLI before committing these changes. A script in your project's toolchain that corrects
all automatically fixable issues (formatting, certain types of linter warnings, etc) makes this easy and natural. If you
use [npm](https://www.npmjs.com), this could be called `npm run fix`. If you use Make, it could be `make fix`.

## Create dedicated CI failure for formatting problems

Your CI server should enforce correct formatting. If you run the formatting checks as a
[separate status check](https://help.github.com/en/github/administering-a-repository/about-required-status-checks),
contributors get feedback about wrong formatting quickly and clearly visible as such.

## Squash-merge feature branches

Consider
[squash-merging](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits)
your pull requests. Doing so keeps Prettifier's fixes but eliminates the commits it made. It also gets rid of other
cruft and detours that happened during development and are no longer relevant after the feature is shipped.

## Git Town

Minimize merge conflicts by keeping your local Git branches in sync with their remote counterpart on GitHub by regularly
running `git town sync` from the [Git Town](http://www.git-town.com) toolkit.
