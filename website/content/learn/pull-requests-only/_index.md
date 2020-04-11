---
title: Pull Requests Only
weight: 30
---

If you or your tools don't auto-formate changes during development, and you keep
pushing ongoing progress to GitHub as a backup, the ongoing merge conflicts with
the formatting commits of Prettifier can get in the way.

To support this workflow, Prettifier offers a **Pull Request Only** mode in
which it only formats branches with open pull requests.

{{< figure title="Prettifier formats a pull request after it was created"
           src="/learn/pull-requests-only/images/screenshot_annotated.png"
           alt="screenshot">}}

Use the [pullsOnly]({{%relref "learn/pull-requests-only/_index.md" %}})
configuration option to enable _Pull Requests Only mode_.
