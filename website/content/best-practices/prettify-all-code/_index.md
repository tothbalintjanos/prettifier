---
title: Prettify All Code
weight: 20
---

If your files aren't properly formatted as a baseline, Prettifier will introduce
many unrelated changes when it formats files. To prevent this, use the [format
script]({{%relref "functionality/direct-commit/_index.md" %}}) made in the
previous step to format all files in your code base before activating
Prettifier.

Commit to Prettier as the standard format for your code. Even if you don't agree
with all the decisions it makes, it avoids a wide range of unproductive
[bike-shed debates](https://en.wikipedia.org/wiki/Law_of_triviality) around
indentation, position of parentheses and braces, etc. The benefits of using a
code formatter like Prettier far outweight its disadvantages.
