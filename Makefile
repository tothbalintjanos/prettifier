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

doc:  # verifies the documentation
	@(cd bot && make --no-print-directory build)
	@tools/text-runner/node_modules$/.bin$/text-run --format dot --offline

fix:  # fixes the auto-fixable formatting issues
	@tools/prettier/prettify --write

help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:  # lints the code base
	@tools/prettier/prettify -l

test:  # runs all tests
	@make --no-print-directory lint
	@(cd bot && make --no-print-directory test)
	@make --no-print-directory doc

setup:  # prepares the code base for working after being cloned
	@(cd bot && make --no-print-directory setup)
	@(cd tools && make --no-print-directory setup)
	@(cd text-run && yarn)
	@(cd website && yarn)

update:  # updates dependencies to the latest version
	@(cd bot && make --no-print-directory update)
	@(cd tools && make --no-print-directory update)
