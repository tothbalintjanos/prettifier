.DEFAULT_GOAL := build

# platform-specificity
ifdef ComSpec
	/ := $(strip \)
else
	/ := /
endif

build: clean  # builds the production version
	@node_modules$/.bin$/tsc -p .

clean:  # removes all build artifacts
	@rm -rf dist

doc: build  # verifies the documentation
	node_modules$/.bin$/text-run --format dot --offline

fix:  # fixes the auto-fixable formatting issues
	node_modules$/.bin$/prettier --write '*.md'
	node_modules$/.bin$/prettier --write '*.yml'
	node_modules$/.bin$/prettier --write '*.json'
	node_modules$/.bin$/prettier --write 'src/**'
	node_modules$/.bin$/prettier --write 'test/*.ts'
	node_modules$/.bin$/prettier --write '.github/**'

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:  # lints the code base
	node_modules$/.bin$/tsc --noEmit
	node_modules$/.bin$/tslint --project tsconfig.json
	node_modules$/.bin$/prettier -l '*.md'
	node_modules$/.bin$/prettier -l '*.yml'
	node_modules$/.bin$/prettier -l '*.json'
	node_modules$/.bin$/prettier -l 'src/**'
	node_modules$/.bin$/prettier -l 'test/*.ts'
	node_modules$/.bin$/prettier -l '.github/**'

log:   # shows the log output from the production server
	heroku logs --tail --app prettifier-prod

test:  # runs all tests
	@node_modules$/.bin$/tsc --noEmit &
	@node_modules$/.bin$/tslint --project tsconfig.json &
	@node_modules$/.bin$/prettier -l '*.md' &
	@node_modules$/.bin$/prettier -l '*.yml' &
	@node_modules$/.bin$/prettier -l '*.json' &
	@node_modules$/.bin$/prettier -l 'src/**' &
	@node_modules$/.bin$/prettier -l 'test/*.ts' &
	@node_modules$/.bin$/prettier -l '.github/**' &
	@node_modules$/.bin$/text-run --format dot --offline &
	@node_modules$/.bin$/mocha
.PHONY: test

start:   # starts the server
	yarn start

unit:  # runs the unit tests
	@node_modules$/.bin$/mocha

update:  # updates the dependencies
	yarn upgrade --latest
