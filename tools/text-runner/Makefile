# platform-specificity
ifdef ComSpec
	/ := $(strip \)
else
	/ := /
endif

fix:
	@../prettier/node_modules$/.bin$/prettier --write *.json

help:   # shows all available Make commands
	@cat Makefile | grep '^[^ ]*:' | grep -v '.PHONY' | grep -v help | sed 's/:.*#/#/' | column -s "#" -t

lint:
	@../prettier/node_modules$/.bin$/prettier -l *.json

setup:
	@yarn

update:
	@yarn upgrade --latest
