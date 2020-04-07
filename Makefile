.DEFAULT_GOAL := build

# platform-specificity
ifdef ComSpec
	/ := $(strip \)
else
	/ := /
endif

build: clean  # builds all code bases
	@(cd bot && make --no-print-directory build)
	@(cd website && make --no-print-directory build)

clean:  # removes all build artifacts
	@(cd bot && make --no-print-directory clean)

docs:  # verifies the documentation
	@(cd bot && make --no-print-directory build)
	@tools/text-runner/text-run --format dot --offline
.PHONY: docs

fix:  # fixes the auto-fixable formatting issues
	tools/prettier/prettier --write .
	@(cd bot && make --no-print-directory fix)

help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:  # lints the code base
	@tools/prettier/prettier --list-different .
	@(cd bot && make --no-print-directory lint)

log:   # shows the log output from the production server
	heroku logs --tail --app prettifier-prod

stats:  # shows code statistics
	@find . -type f | grep -v '/node_modules/' | grep -v '/dist/' | grep -v '\./.git/' | grep -v '\./docs/' | grep -v '\./tools/' | grep -v '\./website/website/' | xargs scc

test:  # runs all tests
	@make --no-print-directory lint
	@(cd bot && make --no-print-directory test)
	@make --no-print-directory docs

setup:  # prepares the code base for working after being cloned
	@(cd bot && make --no-print-directory setup)
	@(cd tools && make --no-print-directory setup)
	@(cd text-run && yarn)
	@(cd website && make --no-print-directory setup)

update:  # updates dependencies to the latest version
	@(cd bot && make --no-print-directory update)
	@(cd tools && make --no-print-directory update)
