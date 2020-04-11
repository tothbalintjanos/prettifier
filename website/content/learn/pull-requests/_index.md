---
title: Pull Requests
weight: 20
---

If Prettifier cannot make a [direct commit](
{{%relref "functionality/direct-commit/_index.md" %}}) into the respective
branch, for example because this branch is
[protected](https://help.github.com/en/github/administering-a-repository/about-protected-branches),
it creates a pull request with the formatting fixes.

{{% notice note %}} You have to approve and merge this pull request yourself.
Prettifier doesn't try to click its way around branch protections.
{{% /notice %}}

{{< figure title="a pull request made by Prettifier"
           src="/learn/pull-requests/images/screenshot_pull_request.png"
           alt="screenshot">}}

{{% notice tip %}} These pull requests won't happen that often if you configure
your CI server to also enforce proper formatting of pull requests by running
[Prettier](https://prettier.io). {{% /notice %}}
