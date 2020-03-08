# Prettifier <img src="website/website/static/img/logo_transparent_400.gif" width="33" height="23">

[![CircleCI](https://circleci.com/gh/kevgo/prettifier.svg?style=shield)](https://circleci.com/gh/kevgo/prettifier)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/kevgo/prettifier.svg)](https://lgtm.com/projects/g/kevgo/prettifier/context:javascript)

_A GitHub bot that keeps your code base consistently formatted._

Please see the [documentation](https://kevgo.github.io/prettifier) for how to
use Prettifier.

This is the source code of Prettifier. It is organized as a monorepository. Each
top-level directory contains some aspect of the code base:

- [.circleci](.circleci/): CI configuration
- [.github](.github/): configuration for the Prettifier instance keeping this
  repository formatted
- [bot](bot/): source code for the GitHub bot
- [text-run](text-run/): documentation tests
- [tools](tools/): development tools
- [website](website/): source code for the
  [website](https://kevgo.github.io/prettifier)
