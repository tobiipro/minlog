ifeq (,$(wildcard support-firecloud/Makefile))
INSTALL_SUPPORT_FIRECLOUD := $(shell git submodule update --init --recursive support-firecloud)
ifneq (,$(filter undefine,$(.FEATURES)))
undefine INSTALL_SUPPORT_FIRECLOUD
endif
endif

include support-firecloud/repo/Makefile.pkg.node.mk

# ------------------------------------------------------------------------------

JEST = $(call which,JEST,jest)

# ------------------------------------------------------------------------------

.PHONY: test
test: ## Test.
	@$(ECHO_DO) "Testing..."
	$(JEST)
	@$(ECHO_DONE)
