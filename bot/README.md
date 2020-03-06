# Prettifier Bot source code

This is the source code for the Prettifier bot.

### Setup

Install these tools:

- [Node.js](https://nodejs.org) version 8 or later
- [Yarn](https://yarnpkg.com/en/docs/install)

Run <code textrun="verify-make-command"> make setup </code>.

To prepare deployment: `heroku git:remote -a originate-intrabot`

### Testing

- run all tests: <code textrun="verify-make-command">make test</code>
- run TypeScript transpiler: <code textrun="verify-make-command">make
  build</code> or `make`
- run the linters: <code textrun="verify-make-command">make lint</code>
- run the unit tests: <code textrun="verify-make-command">make unit</code>
- fix the auto-fixable issues: <code textrun="verify-make-command">make
  fix</code>

To debug a change in production:

- make your changes in a branch called `test`
- run `make deploy-test` to deploy this `test` branch to production
- run `make logs` to see the production logs

### Deployment

- deploy the current branch to production: run
  <code textrun="verify-make-command">make deploy</code> inside this directory

### DevOps

- this code base uses GitHubOps: production incidents get filed as GitHub
  tickets at https://github.com/kevgo/prettifier/issues
