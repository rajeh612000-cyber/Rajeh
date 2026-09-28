# Exact edits on existing pages

Every "find" string below was copied from the live HTML on 2026-09-28. Make these edits in Elementor
(homepage HTML widgets, header template) and the block editor (blog post).

## Homepage: solution cards (the "Four standalone solutions" HTML widget)

| Find | Replace with |
|---|---|
| `<a class="sv-cardlink" href="#price-optimizer-demo">Preview the concept →</a>` | `<a class="sv-cardlink" href="/solutions/price-optimizer/">Explore Price Optimizer →</a>` |
| `<a class="sv-cardlink" href="#promo-planner-demo">Preview the concept →</a>` | `<a class="sv-cardlink" href="/solutions/promotion-planner/">Explore Promotion Planner →</a>` |
| `<span class="sv-cardnote">Stronger Category</span>` | `<a class="sv-cardlink" href="/solutions/category-management/">Explore Category Management →</a>` |

Leave Innovation Launch's `Smarter Launches` pill as it is: it has no page yet.
Descriptive anchor text ("Explore Price Optimizer") tells Google what the target page is about. "Preview the concept" doesn't.

## Homepage: price demo ("What happens if you change the price?")

| Find | Replace with |
|---|---|
| `<a class="po-link" href="https://smartvalueaisolutions.com/strategic-acceleration/">See how scenario testing works &rarr;</a>` | `<a class="po-link" href="/solutions/price-optimizer/#scenario-testing">See how scenario testing works &rarr;</a>` |

This link points straight at the new page, so no internal link goes through the redirect.

## Homepage: give the two Platform pages an in-content link

They leave the Solutions menu, so give each one a contextual link from the homepage section that describes it.

| Find | Add directly after it |
|---|---|
| `<p class="sb-sub">SmartBot helps commercial teams explore performance, compare scenarios and turn analysis into a clear commercial answer.</p>` | `<p class="sb-sub"><a href="/ai-decision-support-smart-bot/">Meet SmartBot →</a></p>` |
| `<p class="dta-sub">No need to replace your existing reporting tools or start a major technology transformation.</p>` | `<p class="dta-sub"><a href="/commercial-analytics/">See how Commercial Analytics starts from your data →</a></p>` |

## Homepage and header: remove redirect hops

| Where | Find | Replace with |
|---|---|---|
| Header template (logo) | `href="http://smartvalueaisolutions.com"` | `href="https://smartvalueaisolutions.com/"` |
| Homepage, "Start simple" section | `href="/contact-us" class="ss-btn"` | `href="/contact-us/" class="ss-btn"` |
| Homepage, industries section | `href="/contact-us">talk to us about yours` | `href="/contact-us/">talk to us about yours` |
| Homepage, "What it helps you decide →" link | `href="/partner-with-us">` | `href="/solutions/">` |

Each of these currently costs a 301 hop (http→https, or a missing trailing slash).

The "What it helps you decide →" link currently goes to Partner with Us. That doesn't match its text, and the new
hub answers exactly that. If pointing it at the Partner page was deliberate, use `href="/partner-with-us/"` instead.

## Blog post: "Data-Driven Decision Making in FMCG…"

Open the post in the block editor, click each linked phrase, and change its URL:

| Linked text | Currently | Change to | Why |
|---|---|---|---|
| "commercial move" | `/commercial-analytics/` | `/solutions/price-optimizer/#scenario-testing` | The sentence is about modelling outcomes before committing, which is scenario testing. |
| "Contact us" | `/commercial-analytics/` | `/contact-us/` | This is a bug: the contact link points at a product page. |

## Menu (Appearance → Menus, or the Nav Menu widget in your Elementor header)

```
Solutions          → Custom link /solutions/            (currently "#")
  Price Optimizer        /solutions/price-optimizer/
  Promotion Planner      /solutions/promotion-planner/
  Category Management    /solutions/category-management/
Platform           → Custom link #
  Commercial Analytics   /commercial-analytics/
  AI Decision Support    /ai-decision-support-smart-bot/
```

Remove "Strategic Acceleration" from the menu.
