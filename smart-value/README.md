# Smart Value™ / Marketeers Research — email

Sender: `mariam@marketeersresearch.com`, sending through GetResponse.

| File | What it is |
|---|---|
| `email-01-launch-article.html` | The send. Paste into GetResponse. |
| `email-01-launch-article.txt` | The plain-text part. Not optional, see below. |
| `template-base.html` | Shell plus module library for every email after this one. |

## Before you send

**1. Host the two logos.** This is the only blocker. The email points at:

```
https://smartvalueaisolutions.com/email-assets/smart-value-logo-white.png
https://smartvalueaisolutions.com/email-assets/marketeers-logo-white.png
```

Both are the **white / light-on-dark** variants, because both logo bands sit on
navy. Export from the source files at 2x and let the HTML scale them down:

| File | Export at | Displays at | Sits on |
|---|---|---|---|
| `smart-value-logo-white.png` | 456 × 152 | 228 × 76 | `#1A1A4E` |
| `marketeers-logo-white.png` | 432 × 136 | 216 × 68 | `#08306b` |

PNG with transparency, compressed (TinyPNG or similar; each should land under
30KB). Upload anywhere on a domain you control that serves over HTTPS and does
not hotlink-block. If they live on the Marketeers domain instead, just change
both `src` values. Do not use a Google Drive or Dropbox share link, those do not
serve as images to email clients.

The light-background logo variants are not used here. Keep them for anything on
a white background.

**2. Add the postal address.** Replace
`[[REPLACE: registered street address, city, country]]` in both the HTML and the
text file. A physical address is required by CAN-SPAM and by GDPR practice, and
filters check for it.

**3. Confirm the unsubscribe tag.** `{{REMOVE_URL}}` is GetResponse's. If your
account inserts something different, use whatever the GetResponse editor itself
produces rather than hand-writing a link.

The article URL is already in place, in all three spots (Outlook VML button,
normal button, text part).

## The first-name question

The merge field is resolved by GetResponse before the email leaves. The client
never sees it, so it cannot affect rendering. The syntax with a fallback:

```
{{CONTACT `ucfw(subscriber_first_name)` `there`}}
```

`ucfw()` upper-cases the first word, which fixes contacts stored as `ahmed` or
`AHMED`. The backtick `there` is what shows when the field is empty.

**The fallback matters more than the personalization does.** "Dear ," is the
clearest possible signal that an email came out of a database. If you would
rather show a different sentence entirely when the name is missing:

```
{{IF `(subscriber_first_name IS_DEFINED)`}}Dear {{CONTACT `ucfw(subscriber_first_name)`}},{{ELSE}}Hello,{{END}}
```

Worth doing before this send: audit the first-name column. Company names,
"Info", "Sales", and full names in the first-name field are common in B2B lists,
and "Dear Procurement Department," reads worse than no name at all.

If you ever move off GetResponse: Gmail multi-send uses `@firstname` with a
default set by hovering the tag, GMass uses `{FirstName|there}`, Mailmeteor uses
`{{First Name}}` with a fallback column in the sheet.

## Subject line

Should read like a colleague wrote it, not a campaign.

- **A. The promotion meeting** — plainest, no promotional trigger words,
  highest open rate from a named human sender. My recommendation.
- **B. Three dashboards open, decision made on instinct** — carries the hook
  into the inbox and qualifies readers before they open.
- **C. A question about how you decide promotions** — sets up a reply, which is
  the response you actually want.

Preheader already in the file: "Three dashboards open, all the data current, and
the promotion still gets decided on instinct." Do not repeat the subject line
there, Gmail shows both.

## How the design works

The email is built as a letter with brand furniture at each end, rather than as
a campaign. Reading down: Smart Value™ masthead on its navy, a ribbon carrying
both palettes left to right, the letter itself on white, the pull quote as the
one designed moment, then a mirrored ribbon into the Marketeers provenance band.

Both branded bands are navy by design. That is what makes the dual-brand story
work in the right order (Smart Value™ is the subject, Marketeers is the
credential), and it also solves dark mode: the bands are already dark, so only
the white letter in the middle needs overriding. Logo swapping between light and
dark variants is unreliable across clients, and this sidesteps it entirely.

The ribbon is the one device that carries both palettes at once: Marketeers navy
and red, Smart Value™ purple and amber, Marketeers yellow. The two brands share
only white as an exact hex, so it borrows the shared *role* (navy anchor, warm
accent) instead of forcing a shared colour.

What the code handles:

- Two images only, both logos. Roughly 2,400 characters of live text against the
  ~400 floor filters look for, so the image-to-text ratio is comfortable.
- Both logos carry real alt text styled white at the right size, so a recipient
  with images off still sees "Smart Value™ AI Solutions" in white on navy rather
  than a broken icon. Worth previewing with images disabled at least once.
- Tables and inline CSS throughout. No `div` columns, no flexbox, no web fonts.
- Outlook: VML button, `mso` font fallbacks, conditional wrapper tables. The
  Georgia pull quote falls back to Arial rather than to Times.
- Dark mode handled explicitly for Apple Mail, Gmail and Outlook.com.
- Two outbound links plus the unsubscribe and Mariam's mailto. 16.6KB.

## Deliverability

Sending from `marketeersresearch.com` rather than a free address changes the
picture for the better. Since February 2024 Google and Yahoo require SPF, DKIM
and DMARC from bulk senders, and on your own domain all three are available.

- **Authenticate the domain in GetResponse before this send.** GetResponse will
  give you DKIM records to add to the Marketeers DNS. If DKIM is not signed and
  DMARC is not published, this is the single most likely reason a well-built
  email lands in spam. Everything else on this list matters less.
- **Send the plain-text part.** GetResponse can auto-generate one, but the
  auto-generated version of a table-based email is usually mangled. Paste
  `email-01-launch-article.txt` in manually.
- **Warm up if this list has not been mailed.** A few hundred a day, climbing.
  Sending cold to a large list from a domain with no sending history is how a
  domain reputation gets damaged, and it is slow to repair.
- **Watch the reply address.** The email promises that a "no thanks" reply gets
  someone removed. Somebody has to actually read and action that inbox, or the
  promise is false and the complaints become spam reports.

## Copy notes

Your draft was already strong. The scene paragraph and the line about data not
pointing to a decision are the best things in it and I left both nearly
untouched. What changed:

- Opening rewritten around your actual title. It now names the role once and
  then explains the relationship between the two companies, rather than packing
  the role, the product, the parent company and 32 years of history into one
  sentence with an em dash in the middle.
- "AI-powered revenue growth management solution" became "revenue growth
  management software". Three stacked modifiers read as positioning rather than
  description, and the AI claim is already made by the company name.
- "all of the data current" to "all of the data is current".
- "our first article explains" split into its own sentence, so the CTA has a
  clean run-up.
- "optimise your growth decisions" to "optimise growth decisions". Dropping the
  possessive makes the permission line sound less templated.
- "Read the article here:" became a real CTA. "Here" as link text is invisible
  to screen readers and weak everywhere else.

Every visible instance of Smart Value carries ™. The only bare mentions left are
inside code comments naming colour swatches, which never render.

## Two things I would change but did not, because they are your call

**The CTA could be a reply rather than a click.** From a named human to senior
commercial people, "reply and I will send it to you" usually beats a button and
starts the conversation you actually want. Module F in `template-base.html` is
the swap. I left the button because the article is the stated goal of the send.

**The permission paragraph sits above the signature.** It is honest and it is
the right legal posture, but it is also the coldest sentence in the email and it
is the last thing read before Mariam's name. Moving it into the footer keeps the
compliance and loses the cold note. Left where you wrote it in case the
placement was deliberate.

## Testing

Litmus or Email on Acid if you have access. Failing that, send to yourself and
check: Gmail web, Gmail iOS, Outlook desktop on Windows, Apple Mail in dark
mode, and **once with images blocked**. Outlook desktop is the one that breaks
things; images-off is the one people forget.
