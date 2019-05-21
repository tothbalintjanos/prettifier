## Contributing

### Developer machine setup

- install [Node.js](https://nodejs.org) version 8 or later
- install [Yarn](https://yarnpkg.com/en/docs/install)

### Set up the code base

```
yarn install
```

### Running the tests

- transpile TypeScript sources: <code textrun="verify-make-command">make build</code> or `make`
- run all tests: <code textrun="verify-make-command">make test</code>
- run the linters: <code textrun="verify-make-command">make lint</code>
- run the unit tests: <code textrun="verify-make-command">make unit</code>
- fix the auto-fixable formatting issues: <code textrun="verify-make-command">make fix</code>

### Getting help

- run `make help` to see all available make commands
