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

## 3. Setting it up — four steps

Do these once, on the computer that has Resolve.

### Step 1 — get this repo onto that computer

```bash
git clone https://github.com/rajeh612000-cyber/rajeh.git
cd rajeh
```

(If you already have it, just `cd` into it and `git pull`.)

### Step 2 — run the installer

```bash
python3 tools/davinci-resolve-mcp/install.py
```

On Windows use `python` instead of `python3`.

This does the boring plumbing for you: it builds a little private Python
sandbox, finds where Resolve is installed, and offers to wire itself into
Claude Desktop, Claude Code, Cursor, VS Code and others. When it asks which
clients to configure, pick the ones you actually use.

You need **Python 3.10 or newer** and **Resolve 18.5 or newer**.

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

### Step 4 — start Claude and check

Close and reopen Claude Desktop (or start `claude` in this folder). Then ask:

> *What DaVinci Resolve tools do you have?*

If Claude lists Resolve tools, you're done. 🎉

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

## 7. When it doesn't work

| What you see | What to do |
|---|---|
| Claude lists no Resolve tools | Fully quit and reopen Claude. Config is only read at startup. |
| "Could not connect to Resolve" | Is Resolve actually open, with a project loaded? Did you do Step 3 and restart? |
| Free edition, nothing connects | Re-check the bridge box in Step 3 — the `resolve_bridge` script has to be *running* from the Workspace menu. |
| macOS: the script isn't in the Workspace → Scripts menu | Resolve only looks for Python in two places. Run `launchctl setenv PYTHON3HOME "$(python3 -c 'import sys; print(sys.prefix)')"` then restart Resolve. (This resets on reboot.) |
| Wrong Python is being used | Set `DVR_MCP_PYTHON` to the full path of `tools/davinci-resolve-mcp/venv/bin/python` (on Windows: `venv\Scripts\python.exe`). |

Deeper documentation, including every tool and every platform quirk, is in
`tools/davinci-resolve-mcp/README.md` and `tools/davinci-resolve-mcp/docs/`.
