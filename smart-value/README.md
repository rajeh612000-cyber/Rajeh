# Smart Value / Marketeers Research — email

Files in this folder:

| File | What it is |
|---|---|
| `email-01-launch-article.html` | The send. Paste into GetResponse. |
| `email-01-launch-article.txt` | The plain-text part. Not optional, see below. |
| `template-base.html` | Empty shell plus a module library for every email after this one. |

## Before you send: three replacements

1. `https://REPLACE-WITH-ARTICLE-URL` — appears twice in the HTML (once in the
   Outlook VML block, once in the normal button) and once in the text file.
   Replace all three or Outlook readers get a dead button.
2. `[[REPLACE: registered street address, city, country]]` — a physical postal
   address is required by CAN-SPAM and by GDPR practice. Filters check for it.
3. `{{REMOVE_URL}}` — GetResponse normally injects this. If your account uses a
   different unsubscribe tag, use whatever GetResponse's own editor inserts
   rather than hand-writing a link.

## The first-name question

The merge field is resolved by GetResponse before the email leaves. The email
client never sees it, so nothing about it affects rendering. For GetResponse the
syntax with a fallback is:

```
{{CONTACT `ucfw(subscriber_first_name)` `there`}}
```

`ucfw()` upper-cases the first word, which fixes contacts stored as `ahmed` or
`AHMED`. The backtick `there` is the fallback when the field is empty.

**The fallback matters more than the personalization.** A bare "Dear ," is the
single clearest signal that an email came out of a database, and it undoes the
personal-send effect you are paying for. If you would rather show a different
sentence entirely when the name is missing:

```
{{IF `(subscriber_first_name IS_DEFINED)`}}Dear {{CONTACT `ucfw(subscriber_first_name)`}},{{ELSE}}Hello,{{END}}
```

If you ever move off GetResponse the syntax changes but the principle does not:
Gmail multi-send uses `@firstname` with a default set by hovering the tag,
GMass uses `{FirstName|there}`, Mailmeteor uses `{{First Name}}` and needs a
fallback column in the sheet.

One thing worth doing before this send: audit the list for junk first-name
values. Company names, "Info", "Sales", and full names in the first-name column
are common in scraped B2B data, and "Dear Procurement Department," reads worse
than no name at all.

## Subject line

Written for a personal address, so it should look like a colleague wrote it, not
a campaign. Options:

- **A. The promotion meeting** — plainest, highest open rate from a personal
  sender, no promotional trigger words at all. My recommendation.
- **B. Three dashboards open, decision made on instinct** — carries the hook
  into the inbox. Longer, more "marketing", but it qualifies readers.
- **C. A question about how you decide promotions** — sets up a reply, which is
  the response you actually want.

Preheader (already in the file, change it if you change the subject):
"Three dashboards open, all the data current, and the promotion still gets
decided on instinct."

Do not repeat the subject line in the preheader. Gmail shows both.

## Sending from a personal address

The design is deliberately restrained. The reference emails you liked (Harry's,
Google Store, ZapConnect) are ESP sends from warmed marketing domains, and
copying that visual weight from a personal address produces a mismatch that both
filters and humans notice. So this email has no images, one link, and a layout
that reads as a letter with brand furniture rather than a campaign.

What the code already does for you:

- Zero images. Nothing breaks when images are blocked, and the image-to-text
  ratio problem disappears entirely. Roughly 1,000 characters of live text,
  well past the ~400 character floor filters look for.
- Tables and inline CSS throughout. No `div` columns, no flexbox, no web fonts.
- One outbound link plus the unsubscribe. No shorteners.
- Under 100KB by a wide margin.
- Outlook handled properly: VML button, `mso` font fallbacks, conditional
  wrapper tables. The Georgia pull quote falls back to Arial in Outlook rather
  than to Times.
- Dark mode handled explicitly for Apple Mail, Gmail and Outlook.com instead of
  letting each client invert the colours on its own.

What you still have to do outside the code, and it matters more than the HTML:

- **Send the plain-text part.** GetResponse can auto-generate one, but the
  auto-generated version of a table-based email is usually mangled. Paste
  `email-01-launch-article.txt` in manually.
- **Check SPF, DKIM and DMARC** on the sending domain. Since February 2024
  Google and Yahoo require all three for bulk senders, and this is the most
  common reason a well-built email lands in spam. If Mariam is sending from a
  free Gmail address rather than a company domain, this is worth a conversation
  before the send: you cannot set DKIM on `@gmail.com`, and B2B recipients'
  filters treat a free-mail sender making a commercial pitch far more harshly
  than a domain sender.
- **Warm up.** If this list has not been mailed before, do not send the whole
  thing at once. A few hundred a day, climbing.
- **Watch the reply address.** The email asks for a "no thanks" reply. Someone
  has to actually be reading and actioning that inbox, or the opt-out promise is
  false and the complaints turn into spam reports.

## Copy changes I made

The original was already in good shape. The scene paragraph and the line about
data not pointing to a decision are the strongest things in it and I left both
almost untouched. What changed:

- Split the opening sentence. The original packed the role, the product
  description, the parent company and 32 years of history into one sentence with
  an em dash in the middle. It is the first thing a stranger reads and it was
  doing too much.
- Cut "AI-powered revenue growth management solution" to "revenue growth
  management software". Three modifiers stacked in front of a noun reads as
  positioning rather than description, and the "AI" claim is already made by the
  company name two words earlier.
- "all of the data current" to "all of the data is current". The clipped version
  was slightly off.
- "our first article explains" became its own sentence, so the CTA has a clean
  run-up.
- "optimise your growth decisions" to "optimise growth decisions". Dropping the
  possessive makes the permission line sound less like a template.
- "Read the article here:" became a real CTA. "Here" as link text is invisible
  to screen readers and weak everywhere else.

## Two things I would change but did not, because they are your call

**The CTA should probably be a reply, not a click.** From a personal address to
senior commercial people, "reply and I will send it to you" converts better than
a button, and it starts the conversation you actually want. It also drops you to
zero outbound links, which is excellent for deliverability. Module F in
`template-base.html` is the swap if you want it.

**The permission paragraph sits above the signature.** It is honest and it is
the right legal posture, but it is also the least warm sentence in the email and
it is the last thing read before Mariam's name. Moving it below the signature,
into the footer zone, keeps the compliance and loses the cold note. I left it
where you wrote it because the placement may have been deliberate.

## Testing

Litmus or Email on Acid if you have access. Failing that, send to yourself and
check at minimum: Gmail web, Gmail iOS app, Outlook desktop on Windows, and Apple
Mail in dark mode. Outlook desktop is the one that breaks things.
