# Smart Value™ / Marketeers Research — email

Sender: `mariam@marketeersresearch.com`, sending through GetResponse.

| File | What it is |
|---|---|
| `email-01-launch-article.html` | The send. Paste into GetResponse. |
| `email-01-launch-article.txt` | The plain-text part. Not optional, see below. |
| `template-base.html` | Shell plus module library for every email after this one. |

## Subject line

**`The promotion meeting`** — with the preheader already in the file:

> Three dashboards open, all the data current, and the promotion still gets
> decided on instinct.

Alternatives: `Decided on instinct`, `A question about how you decide
promotions`, `Three dashboards, one decision`. Judge a test on clicks, not
opens — Apple Mail Privacy Protection inflates open rate enough to mislead.

## Before you send

**Only one thing is outstanding: the street address.** The footer currently
reads "London, United Kingdom", which is a city, not an address. CAN-SPAM
requires a valid physical postal address and UK PECR expects an identifiable
sender, so add the street line and postcode in both the HTML and the text file,
for example "12 Example Street, London EC1A 1AA, United Kingdom". Filters also
score a bare city lower than a full address.

Logos, the article link and the unsubscribe tag are wired and need nothing.

## The "Failed to save draft" error

The cause was the unsubscribe tag. `{{REMOVE_URL}}` is not a GetResponse tag.
GetResponse requires **`[[remove]]`** in custom HTML and validates for it on
save, rejecting the message rather than saving without a valid opt-out. That one
substitution is the actual fix.

While in there I also stripped everything else a GetResponse sanitizer commonly
chokes on, so the draft saves first time rather than failing on the next thing:

- All Outlook conditional comments and the VML `<v:roundrect>` button.
- The `<o:OfficeDocumentSettings>` XML block and every `xmlns` attribute.
- All `mso-` CSS properties.
- The XHTML doctype, now a plain `<!DOCTYPE html>`.
- The zero-width-space entities that padded the preheader.

**What this costs:** the button renders square in Outlook desktop instead of
rounded. It is still a solid purple block, fully clickable, correct everywhere
else. A draft that saves beats a rounded corner.

**What it does not cost:** nothing else. Width still holds at 600px in Outlook
because the tables carry a `width` attribute, which is what Outlook actually
reads. Georgia is a Windows system font, so the pull quote still renders in
Georgia there without the `mso-` fallback.

The file is now 13.9KB.

## Two earlier fixes, still in place

**The merge tag.** The greeting was
``{{CONTACT `ucfw(subscriber_first_name)` `there`}}``. Backticks inside a pasted
HTML block are fragile — the editor can smart-quote or escape them, and a
malformed personalization tag fails validation rather than degrading quietly. The
greeting is now a plain `Hi there,`.

If you want the first name back, do not paste the tag as text. Put the cursor
where it belongs and insert it from GetResponse's own personalization menu, which
writes the syntax the account actually expects and lets you set the fallback in
the UI. Test on a seed list first, and set the fallback to `there` so nobody gets
`Hi ,`.

**The logos.** They pointed at `/email-assets/` paths that were never uploaded.
They now point at your live WordPress files:

```
https://smartvalueaisolutions.com/wp-content/uploads/2026/07/Logo-option-2-white-background-scaled.png
https://marketeersresearch.com/wp-content/uploads/2024/10/Marketeers-Logo-Blue.png
```

**Fixed height attributes.** Both `<img>` tags had `height="76"` and
`height="68"` from the old design. Those were guesses. A height attribute that
does not match the file's real aspect ratio squashes the logo in Outlook, so
both are now width-only with `height:auto`.

## Why both logo bands are now white

You sent the blue-on-light Marketeers logo and the white-background Smart Value™
logo. Both are built for light backgrounds. The previous version put them on navy
bands, which would have rendered each logo inside a visible white rectangle.

So the masthead and the provenance band are both white, and the colour now comes
from the brand ribbon, the purple lead rule, the navy pull quote and the purple
button. Reading down: Smart Value™ masthead, ribbon, the letter, the pull quote
as the one designed moment, mirrored ribbon, then "Smart Value™ is built by" over
the Marketeers logo. That order is the argument — Smart Value™ is the subject,
Marketeers is the credential.

Both bands are pinned white in dark mode through the `.keep-white` class, because
a white-background PNG on an inverted dark band is the ugliest failure mode in
email. Only the letter between them inverts.

There is a third logo you sent, `Smart-Value-fnal-logo-scaled.png`, the version
with navy baked in. It is unused here. It would only work on a band whose hex
matches its baked background exactly, which is not worth the risk.

**One optimisation worth doing.** Both files are WordPress `-scaled` uploads,
which means roughly 2560px wide and likely several hundred KB each. They will
render correctly but load slowly on mobile. When you have a moment, upload copies
at 500px and 420px wide, compress them, and swap the two `src` values. Nothing
else needs to change.

## Deliverability

Sending from `marketeersresearch.com` rather than a free address helps a lot.
Since February 2024 Google and Yahoo require SPF, DKIM and DMARC from bulk
senders, and on your own domain all three are available.

- **Authenticate the domain in GetResponse before this send.** GetResponse gives
  you DKIM records to add to the Marketeers DNS. Unsigned DKIM with no DMARC is
  the most likely reason a well-built email lands in spam, and it matters more
  than anything in the HTML.
- **Paste the plain-text part manually.** GetResponse can auto-generate one, but
  the auto-generated version of a table-based email is usually mangled.
- **Warm up if this list has not been mailed.** A few hundred a day, climbing.
  Cold-blasting a large list from a domain with no sending history damages a
  reputation that is slow to repair.
- **Watch the reply address.** The email promises a "no thanks" reply gets
  someone removed. Someone has to read and action that inbox, or the promise is
  false and complaints become spam reports.

## The build

- Two images, both logos. Roughly 2,300 characters of live text against the ~400
  floor filters look for, so the image-to-text ratio is comfortable.
- Both logos carry real alt text styled at the right size and colour, so an
  images-off recipient reads "Smart Value™ AI Solutions" in navy rather than
  seeing a broken icon. Preview once with images disabled.
- Tables and inline CSS throughout. No `div` columns, no flexbox, no web fonts.
  The `<style>` block only carries mobile and dark mode, so nothing breaks if
  GetResponse strips it.
- No conditional comments, VML, xmlns or `mso-` properties, so GetResponse
  accepts it. Outlook width is held by the tables' `width` attribute instead.
- Two outbound links plus the unsubscribe and Mariam's mailto. 13.9KB.

## Copy notes

The body is unchanged from your draft apart from the greeting. Earlier edits,
still in place: the opening was split so it names the role once then explains the
two companies rather than packing everything into one sentence; "AI-powered
revenue growth management solution" became "revenue growth management software";
"all of the data current" became "all of the data is current"; the article
sentence was split so the CTA has a clean run-up; "Read the article here:"
became a real CTA, since "here" as link text is invisible to screen readers.

Every rendered instance of Smart Value carries ™. The only bare mentions are in
code comments naming colour swatches, which never render.

## Still your call

**The CTA could be a reply rather than a click.** From a named human to senior
commercial people, "reply and I will send it to you" usually beats a button and
starts the conversation you actually want. Module F in `template-base.html` is
the swap. The button stayed because the article is the stated goal.

**The permission paragraph sits above the signature.** Honest and the right legal
posture, but it is the coldest sentence in the email and the last thing read
before Mariam's name. Moving it into the footer keeps the compliance and loses
the cold note.

## Testing

Litmus or Email on Acid if you have them. Otherwise send to yourself and check:
Gmail web, Gmail iOS, Outlook desktop on Windows, Apple Mail in dark mode, and
**once with images blocked**. Outlook desktop breaks things; images-off is the
one people forget.
