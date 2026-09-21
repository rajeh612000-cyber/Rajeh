# Vendored copy — provenance

This folder is a vendored (checked-in) copy of a third-party project. It is not
original work in this repository.

| | |
|---|---|
| Upstream | https://github.com/samuelgursky/davinci-resolve-mcp |
| Version | 4.8.15 |
| Commit | `52430524f39b6021351dd81f733651528246d7dc` (2026-09-20) |
| License | MIT — see `LICENSE` in this folder |
| Vendored on | 2026-09-21 |

## What was removed from the upstream tree

To keep this repository small, the following were dropped. Nothing the MCP
server needs at runtime was touched.

- `.git/` — upstream history
- `tests/` — upstream test suite
- `logs/` — empty log directory
- `resolve-advanced/test/` — upstream test suite for the optional Node server
- `look.cube` — a stray 3-byte export artifact (upstream's own `.gitignore`
  excludes root-level `*.cube`)

## How to update this copy

```bash
git clone --depth 1 https://github.com/samuelgursky/davinci-resolve-mcp.git /tmp/dvr
rm -rf tools/davinci-resolve-mcp
cp -a /tmp/dvr tools/davinci-resolve-mcp
rm -rf tools/davinci-resolve-mcp/.git \
       tools/davinci-resolve-mcp/tests \
       tools/davinci-resolve-mcp/logs \
       tools/davinci-resolve-mcp/resolve-advanced/test \
       tools/davinci-resolve-mcp/look.cube
# then re-add this VENDOR.md and update the table above
```

Local install output (`venv/`, `node_modules/`, `.mcp.json` inside this folder)
is ignored by this folder's own `.gitignore`, so it never gets committed.

Setup instructions for this repository live in `../../DAVINCI-RESOLVE-MCP.md`.
