# Miko Foods — Store Setup Guide

Everything you need to take this theme live on Shopify. No coding required —
every step below is done in the Shopify admin. Follow it top to bottom.

> **What you're working with:** a custom Shopify theme built on **Dawn**
> (Shopify's official, stable theme), branded as Miko Foods — light red/gold/
> black, bilingual (English + العربية), with a mega-menu, rich product cards,
> WhatsApp ordering, and a real cart & checkout.

---

## 0. The 10-minute overview

| Step | What | Where |
|------|------|-------|
| 1 | Add the theme to your store | Online Store → Themes |
| 2 | Create the 4 product metafields | Settings → Custom data → Products |
| 3 | Import the products (`miko-products.csv`) | Products → Import |
| 4 | Create the collections | Products → Collections |
| 5 | Turn on the filters | Search & Discovery app |
| 6 | Build the menu (mega-menu) | Online Store → Navigation |
| 7 | Set your WhatsApp number & check settings | Themes → Customize → Theme settings |
| 8 | Add real product photos (optional but recommended) | Products |
| 9 | Publish | Themes → Publish |

---

## 1. Add the theme

**Option A — Connect from GitHub (recommended, keeps updates easy):**
1. Online Store → **Themes** → **Add theme** → **Connect from GitHub**.
2. Choose this repository and the branch **`claude/miko-foods-ecommerce-01fp8x`**.
3. Shopify pulls the theme in. (It ignores the `docs/`, `scripts/`, and
   `copywriting/` folders — those are just project files.)

**Option B — Upload a ZIP:** download the repo as a ZIP and upload it via
Themes → Add theme → Upload ZIP file.

Leave it **unpublished** for now so you can set everything up behind the scenes.

---

## 2. Create the product metafields (do this BEFORE importing)

The product cards show Arabic names, weight, and prep/quality chips. Those come
from **metafields**. Create these 4 definitions first so the import fills them in.

Go to **Settings → Custom data → Products → Add definition** and create each:

| Name | Namespace and key | Type |
|------|-------------------|------|
| Arabic name | `miko.name_ar` | Single line text |
| Weight label | `miko.weight_label` | Single line text |
| Prep methods | `miko.prep_methods` | Single line text — **List of values** |
| Quality tags | `miko.quality_tags` | Single line text — **List of values** |

For **each** definition, after creating it, click it and under **Storefronts /
access** make sure it's **visible to the storefront** (needed for the chips and
filters to work).

> The namespace/key must match exactly (all lowercase, e.g. `miko.name_ar`) or
> the import won't connect them.

---

## 3. Import the products

1. Products → **Import** → upload **`docs/miko-products.csv`**.
2. Tick **"Publish new products to… Online Store"** and import.
3. You'll get **56 products** (weights merged into variants where it made
   sense — e.g. Beef Kofta 350 g / 850 g is one product with two options).

**About the images:** the CSV points each product at a keyword-matched stock
photo so your store imports **fully populated** — no blank images. These are
**stand-ins**. Replace them with your own Miko photos when you can (see §8).
A few very Egyptian-specific items get an approximate photo — swap these first:
**Hawawshi, Stuffed Mombar, Pigeon (all 3), Kibbeh, Meat/Cheese Samosa.**

**About the lamb:** the 15 lamb cuts (Baladi Lamb + Premium Lamb) import as
**drafts with no price** — because you didn't send prices yet. Open each, set
the price and weight, and switch it to **Active**. The English/Arabic names are
in §10 for you to confirm.

---

## 4. Create the collections (your category tree)

Collections are your categories. Create them under **Products → Collections →
Create collection**. For each, choose **Automated** and the condition
**Product tag → is equal to → [the name below]** (the import already tagged
every product this way).

```
Meat & Poultry            (tag: Meat & Poultry)      ← the whole department
│
├── Beef Steaks           (tag: Beef Steaks)
│   ├── Premium Cuts      (tag: Premium Cuts)
│   ├── Value Cuts        (tag: Value Cuts)
│   └── Veal              (tag: Veal)
│
├── Frozen & Ready-to-Cook (tag: Frozen & Ready-to-Cook)
│   ├── Burgers           (tag: Burgers)
│   ├── Kofta & Sausage   (tag: Kofta & Sausage)
│   ├── Egyptian Classics (tag: Egyptian Classics)
│   ├── Liver & Offal     (tag: Liver & Offal)
│   ├── Minced            (tag: Minced)
│   ├── Pigeon            (tag: Pigeon)
│   ├── Bundles           (tag: Bundles)
│   ├── Sides             (tag: Sides)
│   └── Appetizers        (tag: Appetizers)
│
├── Marinated Chicken     (tag: Marinated Chicken)
│   ├── Strips            (tag: Strips)
│   ├── Breaded           (tag: Breaded)
│   └── Grill             (tag: Grill)
│
├── Baladi Lamb           (tag: Baladi Lamb)
└── Premium Lamb          (tag: Premium Lamb)
```

**Tip — the department page:** for the **Meat & Poultry** collection, in the
collection's **Theme template** dropdown (right sidebar) choose
**`collection.department`**. That gives it the "browse by category" tiles above
the products. Add a collection image for the nicest banner.

Give each collection a short description and an image — they'll show as the
banner and in the homepage tiles.

---

## 5. Turn on the filters (Preparation / Quality / Price)

Install Shopify's free **Search & Discovery** app (by Shopify). Then:
Search & Discovery → **Filters** → **Add filter**:

- Add **Metafield → Prep methods** (`miko.prep_methods`) — label it "Preparation".
- Add **Metafield → Quality tags** (`miko.quality_tags`) — label it "Quality".
- Add **Price**.

These show up as the filter sidebar on every collection page.

---

## 6. Build the menu (the mega-menu)

Online Store → **Navigation** → **Main menu**. Build it 3 levels deep and the
header automatically shows it as a mega-menu:

```
Meat & Poultry            → /collections/meat-poultry
   Beef Steaks            → /collections/beef-steaks
      Premium Cuts        → /collections/premium-cuts
      Value Cuts          → /collections/value-cuts
      Veal                → /collections/veal
   Frozen & Ready-to-Cook → /collections/frozen-ready-to-cook
      Burgers … Appetizers (link each sub-collection)
   Marinated Chicken      → /collections/marinated-chicken
      Strips / Breaded / Grill
   Baladi Lamb            → /collections/baladi-lamb
   Premium Lamb           → /collections/premium-lamb
```

(Add a second-level item, then use the indent arrows to nest its children.)

For a second language menu, Shopify uses the same menu and translates the
links — see §9.

---

## 7. Check your theme settings

Themes → **Customize** → (bottom-left) **Theme settings**:

- **Miko Foods · Contact & WhatsApp** → confirm your **WhatsApp number**
  (`201010402430`), **phone display**, and paste your **Google Maps link**.
  This one number powers the top bar, the floating button, every product's
  "Order on WhatsApp", and the cart's "Send order on WhatsApp".
- **Colours / Typography / Layout** — already set to the Miko brand. Change
  anything here visually if you want; no code needed.
- **Logo** — Theme settings → add your logo image (or it shows "Miko Foods").

The homepage, hero, category tiles, "Why Miko", story and WhatsApp band are all
editable by clicking them in the Customize view.

---

## 8. Add your real product photos (recommended)

The stock stand-in photos get you live immediately, but your own photos will
look far better and avoid any stock-license questions. To swap: Products →
open a product → delete the stock image → drag in your photo. That's it — the
card, gallery and search update automatically. Do the Egyptian-specific items
first (listed in §3).

> Prefer to hand me a folder of photos? Drop them in a shared Drive folder and I
> can map them into the import for you.

---

## 9. Bilingual (English + العربية)

1. Install Shopify's free **Translate & Adapt** app.
2. Settings → **Languages** → add **Arabic** and publish it.
3. The theme already ships Arabic UI strings and flips right-to-left
   automatically for Arabic. Product **names/descriptions** are translated in
   Translate & Adapt (the Arabic product name is also stored in the
   `miko.name_ar` metafield and shown on cards in both languages).
4. A language switcher appears in the header and footer automatically.

---

## 10. Lamb cuts — confirm names & prices

These imported as **drafts**. Please confirm the English name and set a price +
weight for each, then mark **Active**. Correct any Arabic culinary term.

**Baladi Lamb (لحوم بلدي طازجة)**

| English | Arabic | Price | Weight |
|---------|--------|-------|--------|
| Lamb Shoulder | كتف ضاني | — | — |
| Lamb Neck | رقبة ضاني | — | — |
| Lamb Leg | فخذة ضاني | — | — |
| Lamb Ribs (Chops) | ريش ضاني | — | — |
| Lamb Fat (Alya) | لية ضاني | — | — |

**Premium Lamb (لحوم ضاني طازجة)**

| English | Arabic | Price | Weight |
|---------|--------|-------|--------|
| Lamb Leg Steak (Top Round) | وش فخذة | — | — |
| Lamb Shank (Samana) | سمانة | — | — |
| Lamb Fillet Cut | عرق فيليتو | — | — |
| Lamb Roast Cut | عرق روستو | — | — |
| Lamb Escalope | سكالوب | — | — |
| Lamb Shank (Mozza) | موزة | — | — |
| Lamb Kabab Halla | كباب حلة ضاني | — | — |
| Lamb Entrecôte | انتركوت | — | — |
| Lamb Trotters | كوارع | — | — |
| Lamb Knuckle (Akkawi) | عكاوي | — | — |

---

## 11. Discounts (optional)

To show a struck-through price and a `-%` badge on any product, set its
**Compare-at price** higher than the price (Products → variant → Compare-at
price). The badge and strikethrough appear automatically — nothing else to do.

---

## 12. Publish

When you're happy: Themes → find the Miko theme → **Publish**. Do a final pass
on your phone — the whole store is mobile-first.

---

## Good to know / current limits

- **Sort by discount:** Shopify has no native "sort by biggest discount". All
  other sorts (Relevance, Name, Price ↑/↓, Newest) work. A client-side discount
  sort can be added later if you want it.
- **Arabic UI:** the most-used storefront text is translated; less-common Dawn
  strings fall back to English until translated in Translate & Adapt.
- **Re-generating the CSV:** the file was produced by
  `scripts/build_products_csv.py` from the real catalogue — edit that script and
  re-run `python3 scripts/build_products_csv.py` to rebuild `docs/miko-products.csv`.
