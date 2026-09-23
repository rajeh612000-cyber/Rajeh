# DaVinci Resolve + Claude — the "explain it like I'm 5" guide

## 1. What did we just add?

Imagine DaVinci Resolve is a huge machine with a thousand buttons. Normally
**you** push the buttons. An **MCP server** is a remote control that we hand to
Claude, so you can just *say* what you want and Claude pushes the buttons.

You say: *"Make a new timeline called Promo and put the three clips from my
Footage bin on it."*
Claude pushes the buttons. Resolve does it.

That remote control now lives in this repository, at
`tools/davinci-resolve-mcp/`. It's a free, open-source project (MIT licensed) —
see `tools/davinci-resolve-mcp/VENDOR.md` for exactly where it came from.

## 2. The one rule to remember

**The remote control and the machine have to be in the same room.**

Resolve is installed on *your computer*. So this only works when you run Claude
(Claude Desktop, or Claude Code in a terminal) **on that same computer**. It
cannot work from a phone or a cloud session — there's no Resolve there to
control.

> So if you're using Claude on the web or in a cloud session and it reports
> `davinci-resolve` failed to connect, that is **expected, not a broken
> setup** — there is simply no Resolve in the cloud to talk to. Only the
> offline `davinci-resolve-advanced` server works there.

## 3. Setting it up — four steps

Do these once, on the computer that has Resolve.

### Step 1 — get this repo onto that computer

```bash
git clone https://github.com/rajeh612000-cyber/rajeh.git
cd rajeh
```

(If you already have it, just `cd` into it and `git pull`.)

You need **Node.js 18+**, **Python 3.10+**, and **Resolve 18.5 or newer**.

### Step 2 — run the two setup commands

```bash
node tools/davinci-resolve-mcp/bin/davinci-resolve-mcp.mjs setup
npm install --omit=dev --omit=optional --prefix tools/davinci-resolve-mcp/resolve-advanced
```

The first builds a private Python sandbox and finds where Resolve is installed.
The second installs the bits the offline file-reading server needs.

Run these **before** you start Claude — they take a minute, and Claude won't
wait that long when it's starting up.

If the first command ends with *"Setup incomplete — the scripting API did not
load"*, that just means it couldn't find a running Resolve. Do Step 3 and run
it again.

### Step 3 — tell Resolve it's allowed to be remote-controlled

Open Resolve → **Preferences → General → External scripting using → Local**.
Then restart Resolve.

> **If you have the free version of Resolve, not Studio:** Blackmagic blocks
> that switch on the free edition, so Step 3 does nothing for you. There is a
> workaround — a small helper script that runs *inside* Resolve:
>
> ```bash
> python3 tools/davinci-resolve-mcp/scripts/install_resolve_bridge.py
> ```
>
> Then restart Resolve, open a project, and click
> **Workspace → Scripts → resolve_bridge**. Leave it running while you work.
>
> Be aware: this workaround only works on **Resolve 21.0.x and older**. In
> Resolve 21.1 Blackmagic moved Python scripting into Studio, and the free
> edition stopped listing these scripts at all. If you're on free 21.1+, the
> only options are to use Resolve Studio or stay on 21.0.x.

### Step 4 — start Claude from this folder and check

```bash
cd rajeh
claude
```

Or just open Claude Desktop, if the setup command configured it. Then ask:

> *What DaVinci Resolve tools do you have?*

If Claude lists Resolve tools, you're done. 🎉

> **Why "from this folder"?** The `.mcp.json` file that wires this up sits in
> the root of this repo and uses paths relative to it. Start Claude somewhere
> else and it won't find the servers.

## 4. What can you actually ask for?

Plain English, no jargon. Real examples:

- *"What project is open in Resolve right now?"*
- *"Import everything in ~/Videos/wedding into a new bin called Raw."*
- *"Create a 4K 25fps timeline called Teaser."*
- *"Put a marker at every point in the timeline where someone says 'discount'."*
- *"Copy the grade from clip 3 onto clips 4 through 9."*
- *"Set up a render for 1080p H.264 to my Desktop and start it."*
- *"Read the transcript of clip 2 and tell me the three best pull-quotes."*

If a request is ambiguous, Claude will ask — it won't guess with your footage.

## 5. Safety, in one line

Claude can *change* your project: add clips, move things, overwrite grades,
start renders. It cannot undo as reliably as you can. **Save a version before a
big batch request** (Resolve: File → Save Project As…), the same way you would
before letting anyone else sit at your edit bay.

## 6. There are two remote controls, actually

`.mcp.json` in the root of this repo sets up both:

| Name | What it does | Needs Resolve open? |
|---|---|---|
| `davinci-resolve` | Drives a **live** Resolve — editing, media, color, Fusion, audio, rendering. 37 grouped tools (389 individual ones if you add `--full`). | Yes |
| `davinci-resolve-advanced` | Reads and edits Resolve **files** on disk (`.drp`, `.drt`, `.drx`) — grade transfer, conform checks, project inspection. 18 tools. Needs Node.js. | No |

The second one is genuinely useful even with Resolve closed.

Both are launched through Node, so Node.js has to be installed either way.

## 7. When it doesn't work

| What you see | What to do |
|---|---|
| Claude lists no Resolve tools | Fully quit and reopen Claude. Config is only read at startup. |
| "Could not connect to Resolve" | Is Resolve actually open, with a project loaded? Did you do Step 3 and restart? |
| Free edition, nothing connects | Re-check the bridge box in Step 3 — the `resolve_bridge` script has to be *running* from the Workspace menu. |
| macOS: the script isn't in the Workspace → Scripts menu | Resolve only looks for Python in two places. Run `launchctl setenv PYTHON3HOME "$(python3 -c 'import sys; print(sys.prefix)')"` then restart Resolve. (This resets on reboot.) |
| `ModuleNotFoundError: No module named 'anyio'` (or `mcp`) | The Step 2 setup command hasn't been run, or didn't finish. Run it again. |
| Advanced server: `cannot start: dependencies: ...` | Run the second Step 2 command (the `npm install` one). |
| Wrong Python is being used | Set `DAVINCI_RESOLVE_MCP_PYTHON` to the interpreter you want, e.g. `export DAVINCI_RESOLVE_MCP_PYTHON=python3.12`, then re-run Step 2. |

Deeper documentation, including every tool and every platform quirk, is in
`tools/davinci-resolve-mcp/README.md` and `tools/davinci-resolve-mcp/docs/`.
