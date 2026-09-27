
    Function Get-SetupSteps {
        $usePnpm = ($vals.Arch -match "pnpm|Turborepo|Nx")
        $be = $vals.Be
        $header = @"
name: "Copilot Setup Steps"

# Prostředí pro Copilot coding agent. Název jobu MUSÍ být 'copilot-setup-steps'.
on:
  workflow_dispatch:
  push:
    paths:
      - .github/workflows/copilot-setup-steps.yml
  pull_request:
    paths:
      - .github/workflows/copilot-setup-steps.yml

jobs:
  copilot-setup-steps:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4
"@
        $body = ""
        if ($be -match "Python") {
            $body = @"
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: pip

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
          if [ -f pyproject.toml ]; then pip install -e .; fi

      - name: Lint
        run: |
          if command -v ruff >/dev/null 2>&1; then ruff check .; fi

      - name: Type check
        run: |
          if command -v mypy >/dev/null 2>&1; then mypy .; fi

      - name: Test
        run: |
          if [ -f pytest.ini ] || [ -d tests ]; then pytest -q; fi
"@
        } elseif ($be -match "Go \(") {
            $body = @"
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.23'
          cache: true

      - name: Install dependencies
        run: go mod download

      - name: Build
        run: go build ./...

      - name: Vet
        run: go vet ./...

      - name: Test
        run: go test ./...
"@
        } elseif ($be -match "Rust") {
            $body = @"
      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          components: clippy, rustfmt

      - name: Install dependencies
        run: cargo fetch

      - name: Format check
        run: cargo fmt --all -- --check

      - name: Clippy
        run: cargo clippy --all-targets -- -D warnings

      - name: Test
        run: cargo test --all
"@
        } elseif ($be -match "Hono|Edge Functions") {
            $body = @"
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: $(if ($usePnpm) { 'pnpm' } else { 'npm' })
$(if ($usePnpm) { "`n      - name: Setup pnpm`n        uses: pnpm/action-setup@v4`n        with:`n          version: 9`n" })
      - name: Install dependencies
        run: $(if ($usePnpm) { 'pnpm install --frozen-lockfile' } else { 'npm ci' })

      - name: Type check
        run: $(if ($usePnpm) { 'pnpm typecheck' } else { 'npm run typecheck' })

      - name: Lint
        run: $(if ($usePnpm) { 'pnpm lint' } else { 'npm run lint' })

      - name: Test
        run: $(if ($usePnpm) { 'pnpm test' } else { 'npm test' })
"@
        } else {
            $body = @"
$(if ($usePnpm) { "      - name: Setup pnpm`n        uses: pnpm/action-setup@v4`n        with:`n          version: 9`n`n" })      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: $(if ($usePnpm) { 'pnpm' } else { 'npm' })

      - name: Install dependencies
        run: $(if ($usePnpm) { 'pnpm install --frozen-lockfile' } else { 'npm ci' })

      - name: Type check
        run: $(if ($usePnpm) { 'pnpm typecheck' } else { 'npm run typecheck' })

      - name: Lint
        run: $(if ($usePnpm) { 'pnpm lint' } else { 'npm run lint' })

      - name: Test
        run: $(if ($usePnpm) { 'pnpm test' } else { 'npm test' })
"@
        }
        return ($header.TrimEnd() + "`n" + $body)
    }