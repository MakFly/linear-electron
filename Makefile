# ──────────────────────────────────────────────────────────────────────────────
# Linear clone — NativePHP (Electron) + Laravel + Inertia React + shadcn/ui
# Usage: make [target]   (default: help)
# ──────────────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
.PHONY: help install web serve vite electron electron-doctor build db-fresh lint format typecheck check stop

# ── Config ────────────────────────────────────────────────────────────────────
PORT        ?= 8090
PHP_BIN     := vendor/nativephp/electron/resources/js/resources/php/php
PHP_JS      := vendor/nativephp/electron/resources/js/php.js

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD   := \033[1m
DIM    := \033[2m
CYAN   := \033[36m
GREEN  := \033[32m
YELLOW := \033[33m
RED    := \033[31m
RESET  := \033[0m

define banner
	@printf "$(BOLD)$(CYAN)▸ %s$(RESET)\n" $(1)
endef

# ── Help (auto-generated from '##' comments) ──────────────────────────────────
help: ## Show this help
	@printf "\n$(BOLD)Linear clone — dev commands$(RESET)\n\n"
	@printf "$(DIM)Usage:$(RESET) make $(CYAN)<target>$(RESET)\n\n"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / { printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@printf "\n$(DIM)Examples:$(RESET)\n"
	@printf "  make web              $(DIM)# webapp on http://127.0.0.1:$(PORT)$(RESET)\n"
	@printf "  make electron         $(DIM)# native desktop app (NativePHP)$(RESET)\n\n"

# ── Setup ─────────────────────────────────────────────────────────────────────
install: ## Install all dependencies (composer + bun + NativePHP)
	$(call banner,"Installing PHP dependencies")
	composer install
	$(call banner,"Installing JS dependencies")
	bun install
	$(call banner,"Installing NativePHP scaffolding")
	php artisan native:install --no-interaction
	@printf "$(GREEN)✔ Install complete$(RESET)\n"

db-fresh: ## Reset the database and seed the onboarding issues
	$(call banner,"Refreshing database")
	php artisan migrate:fresh --seed
	@printf "$(GREEN)✔ Database ready (DEV-1 → DEV-4 seeded)$(RESET)\n"

# ── Run ───────────────────────────────────────────────────────────────────────
web: ## Run the webapp (Laravel :$(PORT) + Vite HMR, Ctrl-C stops both)
	$(call banner,"Starting webapp — http://127.0.0.1:$(PORT)/team/DEV/active")
	@trap 'kill 0' INT TERM; \
		php artisan serve --port=$(PORT) & \
		bun run dev & \
		wait

serve: ## Run only the Laravel server (:$(PORT))
	php artisan serve --port=$(PORT)

vite: ## Run only the Vite dev server (HMR)
	bun run dev

electron: electron-doctor ## Run the native desktop app (NativePHP + Vite, Ctrl-C stops both)
	$(call banner,"Starting Electron app (+ Vite HMR)")
	@trap 'kill 0' INT TERM; \
		bun run dev & \
		php artisan native:serve --no-interaction & \
		wait

electron-doctor: ## Re-apply the php.js extraction patch (corrupt-binary fix)
	@if ! grep -q "PATCHED" "$(PHP_JS)" 2>/dev/null; then \
		printf "$(YELLOW)⚠ Patching NativePHP php.js (sync extraction fix)$(RESET)\n"; \
		cp scripts/nativephp-php.js "$(PHP_JS)"; \
	fi
	@printf "$(GREEN)✔ NativePHP php.js patch in place$(RESET)\n"

# ── Quality ───────────────────────────────────────────────────────────────────
lint: ## ESLint with autofix
	bun run lint

format: ## Prettier on resources/
	bun run format

typecheck: ## TypeScript check (no emit)
	bunx tsc --noEmit

check: lint typecheck ## Lint + typecheck
	@printf "$(GREEN)✔ All checks passed$(RESET)\n"

# ── Build / misc ──────────────────────────────────────────────────────────────
build: ## Production build of frontend assets
	bun run build

stop: ## Kill dev servers (Laravel, Vite, Electron)
	@-pkill -f "php artisan serve" 2>/dev/null || true
	@-pkill -f "artisan native:serve" 2>/dev/null || true
	@-pkill -f "electron-vite dev" 2>/dev/null || true
	@-pkill -f "Electron.app/Contents/MacOS/Electron ." 2>/dev/null || true
	@-pkill -f "node_modules/.bin/vite" 2>/dev/null || true
	@printf "$(GREEN)✔ Dev processes stopped$(RESET)\n"
