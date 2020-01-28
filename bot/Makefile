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

deploy:  # deploys the bot to Heroku
	@(cd .. && git push heroku `git subtree split --prefix bot master`:master --force)

doc: build  # verifies the documentation
	@../tools/text-runner/node_modules$/.bin$/text-run --format dot --offline

fix:  # fixes the auto-fixable formatting issues
	@../tools/prettier/prettify --write

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:  # lints the code base
	@node_modules$/.bin$/tsc --noEmit
	@node_modules$/.bin$/tslint --project tsconfig.json
	@../tools/prettier/prettify -l

logs:   # shows the log output from the production server
	heroku logs --tail --app prettifier-prod

test:  # runs all tests
	@node_modules$/.bin$/tsc --noEmit &
	@node_modules$/.bin$/tslint --project tsconfig.json &
	@make lint &
	@node_modules$/.bin$/mocha
.PHONY: test

setup:
	@yarn

start:   # starts the server
	yarn start

unit:  # runs the unit tests
	@node_modules$/.bin$/mocha

update:  # updates the dependencies
	yarn upgrade --latest
