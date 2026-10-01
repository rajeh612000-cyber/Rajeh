# Exact edits on existing pages

Every "find" string below was copied from the live HTML on 2026-10-01. Make these edits in Elementor
(homepage HTML widgets, header template) and in the block editor (blog post).

## Menu (Appearance → Menus, or the Nav Menu widget in your Elementor header)

```
Solutions  (stays "#")
  Commercial Analytics   /commercial-analytics/      (keep)
  Price Optimizer        /price-optimizer/           (add)
  Promotion Planner      /promotion-planner/         (add)
```

Remove **Strategic Acceleration** and **AI Decision Support** from the dropdown.

## Homepage: the solutions grid ("Start with the one your brand needs most")

Replace the **whole code** of that HTML widget with `dist/homepage/solutions-grid.html`.
It's your original widget with only these changes:

- Eyebrow: "FOUR STANDALONE SOLUTIONS" → "THREE STANDALONE SOLUTIONS".
- Intro: "Take one, or take all four." → "Take one, or take all three."
- Cards are now 01 Commercial Analytics, 02 Price Optimizer and 03 Promotion Planner. Each one links to its page with
  descriptive anchor text ("Explore Price Optimizer →").
- Category Management and Innovation Launch are removed.

Your styles, the reveal script and the `id="modules"` anchor are unchanged.

## Homepage: price demo ("What happens if you change the price?")

| Find | Replace with |
|---|---|
| `<a class="po-link" href="https://smartvalueaisolutions.com/strategic-acceleration/">See how scenario testing works &rarr;</a>` | `<a class="po-link" href="/price-optimizer/#scenario-testing">See how scenario testing works &rarr;</a>` |

This points straight at the new page, so no internal link goes through the redirect.

## Homepage: link SmartBot (it leaves the menu, so it needs an in-content link)

| Find | Add directly after it |
|---|---|
| `<p class="sb-sub">SmartBot helps commercial teams explore performance, compare scenarios and turn analysis into a clear commercial answer.</p>` | `<p class="sb-sub"><a href="/ai-decision-support-smart-bot/">Meet SmartBot →</a></p>` |

Both new pages also link to SmartBot in their "Runs on the Smart Value™ platform" line.

## Blog post: "Data-Driven Decision Making in FMCG…"

Open the post in the block editor, click each linked phrase, and change its URL:

| Linked text | Currently | Change to | Why |
|---|---|---|---|
| "commercial move" | `/commercial-analytics/` | `/price-optimizer/#scenario-testing` | The sentence is about modelling outcomes before committing, which is scenario testing. |
| "Contact us" | `/commercial-analytics/` | `/contact-us/` | This is a bug: the contact link points at a product page. |

## Optional: remove redirect hops

| Where | Find | Replace with |
|---|---|---|
| Header template (logo) | `href="http://smartvalueaisolutions.com"` | `href="https://smartvalueaisolutions.com/"` |
| Homepage, "Start simple" section | `href="/contact-us" class="ss-btn"` | `href="/contact-us/" class="ss-btn"` |
| Homepage, industries section | `href="/contact-us">talk to us about yours` | `href="/contact-us/">talk to us about yours` |
| Homepage, "What it helps you decide →" link | `href="/partner-with-us">` | `href="#modules">` |

The "What it helps you decide →" link currently goes to Partner with Us, which doesn't match its text. `#modules` scrolls
to the solutions grid on the same page. If pointing it at the Partner page was deliberate, use `href="/partner-with-us/"` instead.
