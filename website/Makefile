.DEFAULT_GOAL := help



build:  # compiles the static HTML files
	@hugo

clear:  # removes the build artifacts
	@rm -rf public

help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

start:  # runs the local development server
	@hugo serve -p 3000

setup:
	ifeq (, $(shell which hugo))
		$(error "Please install hugo, see https://gohugo.io/getting-started/installing")
	endif
