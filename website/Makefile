build:  # compiles the static HTML files
	@(cd website && yarn run build)

help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

setup:
	@(cd website && yarn)

start:  # runs the local development server
	@(cd website && yarn start)
