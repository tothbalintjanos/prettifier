# Prettifier Bot source code

This is the source code for the Prettifier bot.

### Setup

- install [Node.js](https://nodejs.org) version 8 or later
- install [Yarn](https://yarnpkg.com/en/docs/install)
- run <code textrun="verify-make-command"> make setup </code> in the root
  directory of this code base
- run `make help` to see all available make commands

### Testing

- run all tests: <code textrun="verify-make-command">make test</code>
- run TypeScript transpiler: <code textrun="verify-make-command">make
  build</code> or `make`
- run the linters: <code textrun="verify-make-command">make lint</code>
- run the unit tests: <code textrun="verify-make-command">make unit</code>
- fix the auto-fixable issues: <code textrun="verify-make-command">make
  fix</code>

### Deployment

To deploy this bot to Heroku, run `make deploy` inside the [bot](bot/)
directory.

### DevOps

- this code base uses GitHubOps: production incidents get filed as GitHub
  tickets at https://github.com/kevgo/prettifier/issues.
