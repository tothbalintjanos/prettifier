help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

setup:
	@(cd prettier && make --no-print-directory setup)
	@(cd text-runner && make --no-print-directory setup)

update:
	@(cd prettier && make --no-print-directory update)
	@(cd text-runner && make --no-print-directory update)
