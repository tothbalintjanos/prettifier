## Contributing

### Developer machine setup

- install [Node.js](https://nodejs.org) version 8 or later
- install [Yarn](https://yarnpkg.com/en/docs/install)

### Set up the code base

- dependencies are bundled with the code base, no installation necessary

### Running the tests

- transpile TypeScript sources: `make build` or `make`
- run all tests: `make test`
- run the linters: `make lint`
- run the unit tests: `make unit`
- fix the auto-fixable formatting issues: `make fix`

### Getting help

- run `make help` to see all available make commands
