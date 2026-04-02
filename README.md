# flareup

Styled terminal alerts. Drop into any npm script for highly visible success, error, and info messages.

Zero runtime dependencies.

## Install

```bash
npm install -D flareup
```

Or use directly with npx:

```bash
npx flareup success "Tests passed"
npx flareup run -- npm test
```

## Usage

### Direct mode

Display a styled message with a status level:

```bash
flareup "Something happened"           # plain (bold, no color)
flareup success "Tests passed"         # green
flareup error "Build failed"           # red
flareup warn "Slow query detected"     # yellow
flareup info "Deploying to staging"    # purple
flareup debug "Cache hit ratio: 94%"   # cyan
```

### Run mode

Wrap a command. stdout/stderr stream through in real time. A styled summary appears when it finishes. Exits with the wrapped command's exit code.

```bash
flareup run -- npm test
```

Customize the messages:

```bash
flareup run --success "All good" --error "Tests broke" -- npm test
```

Suppress output for one outcome:

```bash
flareup run --no-success -- npm test   # only show on failure
flareup run --no-error -- npm test     # only show on success
```

### In package.json

```json
{
  "scripts": {
    "test": "vitest && flareup success 'Tests passed'",
    "build": "flareup run --no-success -- tsc --build",
    "deploy": "flareup run --success 'Deployed' --error 'Deploy failed' -- ./deploy.sh"
  }
}
```

## Styles

Control the visual presentation with `--style`:

```bash
flareup --style box success "Done"       # light box (default)
flareup --style banner success "Done"    # double box, full terminal width
flareup --style callout success "Done"   # left vertical bar only
flareup --style line success "Done"      # horizontal rules
flareup --style minimal success "Done"   # icon + text, no decoration
flareup --style panel success "Done"     # single top rule, double bottom rule
```

Styles work in both direct and run mode:

```bash
flareup run --style banner -- npm test
```

## Flags

| Flag | Description |
|------|-------------|
| `--style <name>` | Visual style: `box`, `banner`, `callout`, `line`, `minimal`, `panel` |
| `--bell` | Play a terminal bell sound |
| `--no-color` | Disable color output |
| `--help` | Show usage |
| `--version` | Show version |

### Run mode flags

| Flag | Description |
|------|-------------|
| `--success <msg>` | Custom success message |
| `--error <msg>` | Custom error message |
| `--no-success` | Suppress output on success |
| `--no-error` | Suppress output on error |

## Color support

Respects the [`NO_COLOR`](https://no-color.org/) environment variable. Falls back to ASCII icons (`√`, `x`, `!`) in terminals that don't support Unicode.

## Requirements

Node.js 20 or later.

## License

MIT
