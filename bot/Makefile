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

deploy:  # deploys the master branch to Heroku
	@(cd .. && git push heroku $(shell cd .. && git subtree split --prefix bot master):master --force)

deploy-current:  # deploys the current branch to Heroku
	@(cd .. && git push heroku $(shell cd .. && git subtree split --prefix bot $(shell git branch --show-current)):master --force)

fix:  # fixes the auto-fixable formatting issues
	@../tools/prettier/prettify --write
	@node_modules/.bin/tslint --fix --project tsconfig.json

help:   # prints all make targets
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:  # lints the code base
	@node_modules$/.bin$/tsc --noEmit
	@node_modules$/.bin$/tslint --project tsconfig.json
	@../tools/prettier/prettify -l

logs:   # shows the log output from the production server
	heroku logs --tail --app prettifier-prod

stats:  # shows code statistics
	@find . -type f | grep -v '\./node_modules/' | grep -v '\./dist/' | xargs cloc

test:  # runs all tests
	@node_modules$/.bin$/tsc --noEmit &
	@node_modules$/.bin$/tslint --project tsconfig.json &
	@node_modules$/.bin$/mocha src/**/*.test.ts &
	@make --no-print-directory lint
.PHONY: test

setup:
	yarn
	make --no-print-directory test
	heroku git:remote -a originate-intrabot

start:   # starts the server
	yarn start

unit:  # runs the unit tests
	@node_modules$/.bin$/mocha src/**/*.test.ts

update:  # updates the dependencies
	yarn upgrade --latest
