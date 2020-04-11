---
title: Format Script
weight: 10
---

Set up a CLI script that prettifies the entire code base. Developers and scripts
can run this script whenever they made changes and are unsure whether there are
formatting issues. This removes a large amount of edge cases. Prettier makes
this easy:

```
prettier --write .
```

Examples for such tasks could be `npm run format`, `make format`, etc.

{{% notice tip %}} While you are at it, extend this script to run all the tools
that you use to keep your code base in a good shape. An example are linters,
which can often also auto-correct certain issues they find. A better name for
such a script might be `fix` instead of `format`. {{% /notice %}}
