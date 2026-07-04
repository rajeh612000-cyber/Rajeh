#!/usr/bin/env python3
"""
Generate a Shopify product-import CSV for Miko Foods from the real catalogue.

- Same-product / different-weight items are merged into ONE product with
  weight variants.
- Prep/quality/weight/Arabic-name go into `miko` metafields (feed the card
  chips + Search & Discovery filters).
- Category membership goes into tags (build automated collections by tag).
- Image Src uses keyword-matched stock URLs (loremflickr) with a stable lock
  so the store imports fully populated. These are stand-ins to swap for real
  Miko photos — see the setup guide.
"""
import csv, re, os

VENDOR = "Miko Foods"
CATEGORY = "Food, Beverages & Tobacco > Food Items > Meat, Seafood & Eggs"
IMG = "https://loremflickr.com/1000/1000/{kw}?lock={lock}"

# ---- helpers ---------------------------------------------------------------
def handle(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

def grams(label):
    if not label: return 0
    s = label.lower().replace('–', '-')
    m = re.search(r'([\d.]+)\s*kg', s)
    if m: return int(float(m.group(1)) * 1000)
    nums = re.findall(r'(\d+)\s*g', s)
    if nums:
        vals = [int(n) for n in nums]
        # "2 x 200g" or "450-500g"
        if '×' in label or ' x ' in s or '2 x' in s:
            return sum(vals) if len(vals) > 1 else vals[0]
        return sum(vals) // len(vals) if len(vals) > 1 else vals[0]
    return 0

# ---- catalogue -------------------------------------------------------------
# Each product: (title, ar, dept, subcat, prep[], quality[], weight_label, kw,
#                variants[(value, price, comparestr_or_None)], extra_tags[])
P = []
def add(title, ar, dept, subcat, prep, quality, weight, kw, variants, extra=None, draft=False):
    P.append(dict(title=title, ar=ar, dept=dept, subcat=subcat, prep=prep,
                  quality=quality, weight=weight, kw=kw, variants=variants,
                  extra=extra or [], draft=draft))

# ===== Beef Steaks =====
D = "Beef Steaks"
add("Rib Eye", "ريب اي", D, "Premium Cuts", ["Chilled","Grilling"], ["Premium","Halal"], "250g", "ribeye", [("250g",175,None)])
add("T-Bone", "تي بون", D, "Premium Cuts", ["Chilled","Grilling"], ["Halal"], "400g", "tbone", [("400g",290,None)])
add("Strip Loin", "استريب ليون", D, "Premium Cuts", ["Chilled","Grilling"], ["Halal"], "250g", "sirloin", [("250g",160,None)])
add("Tomahawk", "توماهوك", D, "Premium Cuts", ["Chilled","Grilling"], ["Premium","Halal"], "450–500g", "tomahawk", [("450–500g",360,None)], extra=["Showpiece"])
add("Fillet Portion", "فيليه بورشن", D, "Premium Cuts", ["Chilled","Pan Searing"], ["Premium","Halal"], "2 × 200g", "beef-fillet", [("2 × 200g",460,None)])
add("Short Ribs", "شورت ريبس", D, "Value Cuts", ["Chilled","Grilling"], ["Halal"], "350g", "beef-ribs", [("350g",195,None)])
add("Bolognese Steak", "بولونيز استيك", D, "Value Cuts", ["Chilled"], ["Halal"], "450–500g", "beef-steak", [("450–500g",360,None)])
add("Sirloin Cap Sobuco", "سوبوكو بقري", D, "Value Cuts", ["Chilled"], ["Halal"], "350g", "picanha", [("350g",190,None)])
add("Beef Ribs", "ريش بقري", D, "Value Cuts", ["Chilled","Grilling"], ["Halal"], "500g", "beef-ribs", [("500g",350,None)])
add("Beef Steak", "استيك", D, "Value Cuts", ["Chilled"], ["Halal"], "500g", "beefsteak", [("500g",360,None)])
add("Veal Escalope", "اسكالوب بتلو", D, "Veal", ["Chilled","Pan Searing"], ["Veal","Halal"], "500g", "veal", [("500g",360,None)])
add("Veal Kabab Halla", "كباب حلة بتلو", D, "Veal", ["Chilled"], ["Veal","Halal"], "500g", "veal", [("500g",360,None)])

# ===== Frozen & Ready-to-Cook =====
D = "Frozen & Ready-to-Cook"
add("Beef Burger", "برجر بقري", D, "Burgers", ["Frozen","Grilling"], ["Halal"], "350g / 1kg", "hamburger-patty",
    [("50g patties · 350g",80,None),("50g patties · 1kg",230,None),("100g patties · 1kg",230,None)])
add("Cheddar Burger", "برجر شيدر", D, "Burgers", ["Frozen","Grilling"], ["Halal"], "4 pcs · 120g", "cheeseburger",
    [("4 × 120g",130,None)], extra=["Special"])
add("Smash Burger", "سماش برجر", D, "Burgers", ["Frozen","Grilling"], ["Halal"], "500g", "smashburger", [("500g",145,None)])
add("Beef Kofta", "كفتة بقري", D, "Kofta & Sausage", ["Frozen","Grilling"], ["Halal"], "350g / 850g", "kofta",
    [("350g",75,None),("850g",175,None)])
add("Oriental Sausage", "سجق شرقي", D, "Kofta & Sausage", ["Frozen"], ["Halal","Spicy"], "350g / 850g", "sausage",
    [("350g",90,None),("850g",215,None)])
add("Kabab Halla", "كباب حلة", D, "Kofta & Sausage", ["Frozen"], ["Halal"], "500g", "kebab", [("500g",180,None)])
add("Meat Shawarma", "شاورما لحم", D, "Egyptian Classics", ["Frozen","Marinated"], ["Halal"], "500g", "shawarma", [("500g",190,None)], extra=["Egyptian"])
add("Rice Kofta", "كفتة ارز", D, "Egyptian Classics", ["Frozen"], ["Halal"], "350g", "kofta", [("350g",90,None)], extra=["Egyptian"])
add("Hawawshi Meat", "لحمة حواوشي", D, "Egyptian Classics", ["Frozen"], ["Halal"], "500g", "minced-meat", [("500g",110,None)], extra=["Egyptian"])
add("Stuffed Mombar", "ممبار محشي", D, "Egyptian Classics", ["Frozen"], ["Halal"], "500g", "sausage", [("500g",90,None)], extra=["Egyptian"])
add("Marinated Liver", "كبدة متبلة", D, "Liver & Offal", ["Frozen","Marinated"], ["Halal"], "350g / 850g", "liver",
    [("350g",75,None),("850g",180,None)])
add("Liver Slices", "كبدة شرائح", D, "Liver & Offal", ["Frozen"], ["Halal"], "500g", "liver", [("500g",105,None)])
add("Small Livers", "كبدة عصافيري", D, "Liver & Offal", ["Frozen"], ["Halal"], "500g", "chicken-liver", [("500g",105,None)])
add("Minced Beef", "لحم مفروم", D, "Minced", ["Frozen"], ["Halal"], "350g / 850g", "minced-beef",
    [("350g",115,None),("850g",270,None)])
add("Pigeon with Rice", "حمام محشي أرز", D, "Pigeon", ["Frozen"], ["Halal"], "1 pc", "squab", [("1 pc",170,None)])
add("Pigeon with Freekeh", "حمام محشي فريك", D, "Pigeon", ["Frozen"], ["Halal"], "1 pc", "pigeon", [("1 pc",170,None)])
add("Grilled Pigeon", "حمام مشوي", D, "Pigeon", ["Frozen","Grilling"], ["Halal"], "1 pc / 2 pcs", "grilled-pigeon",
    [("1 pc",130,None),("2 pcs",260,None)])
add("Miko Mix", "ميكس ميكو", D, "Bundles", ["Frozen"], ["Halal","Bundle"], "1kg", "meat-assortment", [("1kg",230,None)], extra=["Bundle"])
add("Miko Triple Deal", "عرض ميكو التربل", D, "Bundles", ["Frozen"], ["Halal","Best Deal"], "1kg", "meat-platter", [("1kg",235,None)], extra=["Bundle"])
add("Pomme Frites (Boom)", "بطاطس بوم فريت", D, "Sides", ["Frozen"], [], "2.5kg", "french-fries", [("2.5kg",135,None)])
add("Meat Samosa", "سمبوسة لحم", D, "Appetizers", ["Frozen"], ["Halal"], "10 pcs", "samosa", [("10 pcs",110,None)], extra=["Appetizers"])
add("Cheese Samosa", "سمبوسة جبن", D, "Appetizers", ["Frozen"], [], "10 pcs", "samosa", [("10 pcs",85,None)], extra=["Appetizers"])
add("Kibbeh", "كبيبة", D, "Appetizers", ["Frozen"], ["Halal"], "5 pcs · 80g", "kibbeh", [("5 × 80g",90,None)], extra=["Appetizers"])

# ===== Marinated Chicken =====
D = "Marinated Chicken"
add("Regular Chicken Strips", "استربس عادي", D, "Strips", ["Chilled","Marinated"], ["Halal"], "500g / 1kg", "chicken-strips",
    [("500g",155,None),("1kg",225,None)])
add("Spicy Chicken Strips", "استربس حار", D, "Strips", ["Chilled","Marinated"], ["Halal","Spicy"], "500g / 1kg", "chicken-strips",
    [("500g",155,None),("1kg",225,None)])
add("Chicken Pane", "بانيه", D, "Breaded", ["Frozen","Pan Searing"], ["Halal"], "500g", "chicken-schnitzel", [("500g",150,None)])
add("Cordon Bleu", "كوردن بلو", D, "Breaded", ["Frozen","Pan Searing"], ["Halal","Chef"], "500g", "cordon-bleu", [("500g",175,None)], extra=["Chef"])
add("Chicken Kiev", "تشيكن كييف", D, "Breaded", ["Frozen","Pan Searing"], ["Halal"], "500g", "chicken-kiev", [("500g",150,None)])
add("Shish Tawook", "شيش طاووق", D, "Grill", ["Chilled","Grilling","Marinated"], ["Halal"], "500g", "shish-taouk", [("500g",138,None)])

# ===== Baladi Lamb (prices to confirm -> draft) =====
D = "Baladi Lamb"
for t, ar, prep in [
    ("Lamb Shoulder","كتف ضاني",["Chilled"]),
    ("Lamb Neck","رقبة ضاني",["Chilled"]),
    ("Lamb Leg","فخذة ضاني",["Chilled"]),
    ("Lamb Ribs (Chops)","ريش ضاني",["Chilled","Grilling"]),
    ("Lamb Fat (Alya)","لية ضاني",["Chilled"]),
]:
    add(t, ar, D, "", prep, ["Halal","Fresh Daily"], "", "lamb", [("Per kg",0,None)], draft=True)

# ===== Premium Lamb (prices to confirm -> draft) =====
D = "Premium Lamb"
for t, ar, prep in [
    ("Lamb Leg Steak (Top Round)","وش فخذة",["Chilled"]),
    ("Lamb Shank (Samana)","سمانة",["Chilled"]),
    ("Lamb Fillet Cut","عرق فيليتو",["Chilled","Pan Searing"]),
    ("Lamb Roast Cut","عرق روستو",["Chilled"]),
    ("Lamb Escalope","سكالوب",["Chilled","Pan Searing"]),
    ("Lamb Shank (Mozza)","موزة",["Chilled"]),
    ("Lamb Kabab Halla","كباب حلة ضاني",["Chilled"]),
    ("Lamb Entrecôte","انتركوت",["Chilled","Grilling"]),
    ("Lamb Trotters","كوارع",["Chilled"]),
    ("Lamb Knuckle (Akkawi)","عكاوي",["Chilled"]),
]:
    add(t, ar, D, "", prep, ["Halal","Fresh Daily"], "", "lamb", [("Per kg",0,None)], draft=True)

# ---- emit CSV --------------------------------------------------------------
COLS = ["Handle","Title","Body (HTML)","Vendor","Product Category","Type","Tags","Published",
        "Option1 Name","Option1 Value","Variant SKU","Variant Grams","Variant Inventory Tracker",
        "Variant Inventory Policy","Variant Fulfillment Service","Variant Price","Variant Compare At Price",
        "Variant Requires Shipping","Variant Taxable","Variant Weight Unit","Image Src","Image Position",
        "Image Alt Text","Gift Card","SEO Title","SEO Description","Status",
        "Metafield: miko.name_ar [single_line_text_field]",
        "Metafield: miko.weight_label [single_line_text_field]",
        "Metafield: miko.prep_methods [list.single_line_text_field]",
        "Metafield: miko.quality_tags [list.single_line_text_field]"]

out_path = os.path.join(os.path.dirname(__file__), "..", "docs", "miko-products.csv")
os.makedirs(os.path.dirname(out_path), exist_ok=True)
lock = 100
rows = 0
with open(out_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=COLS)
    w.writeheader()
    for p in P:
        h = handle(p["title"])
        lock += 1
        tags = ["Meat & Poultry", p["dept"]]
        if p["subcat"]: tags.append(p["subcat"])
        tags += p["extra"]
        body = f'<p>{p["title"]} ({p["ar"]}) — halal, prepared fresh by Miko Foods and delivered across Greater Cairo.</p>'
        prep_json = '[' + ','.join('"%s"' % x for x in p["prep"]) + ']'
        qual_json = '[' + ','.join('"%s"' % x for x in p["quality"]) + ']'
        multi = len(p["variants"]) > 1
        opt_name = "Weight" if multi else "Title"
        for i, (val, price, cmp) in enumerate(p["variants"]):
            first = (i == 0)
            row = {c: "" for c in COLS}
            row["Handle"] = h
            row["Option1 Name"] = opt_name
            row["Option1 Value"] = val if multi else "Default Title"
            row["Variant SKU"] = f"MIKO-{h[:18]}-{i+1}".upper()
            row["Variant Grams"] = grams(val if multi else p["weight"])
            row["Variant Inventory Policy"] = "deny"
            row["Variant Fulfillment Service"] = "manual"
            row["Variant Price"] = price if price else ""
            row["Variant Compare At Price"] = cmp or ""
            row["Variant Requires Shipping"] = "TRUE"
            row["Variant Taxable"] = "TRUE"
            row["Variant Weight Unit"] = "g"
            if first:
                row["Title"] = p["title"]
                row["Body (HTML)"] = body
                row["Vendor"] = VENDOR
                row["Product Category"] = CATEGORY
                row["Type"] = p["dept"]
                row["Tags"] = ", ".join(tags)
                row["Published"] = "FALSE" if p["draft"] else "TRUE"
                row["Image Src"] = IMG.format(kw=p["kw"], lock=lock)
                row["Image Position"] = 1
                row["Image Alt Text"] = f'{p["title"]} — {p["ar"]}'
                row["Gift Card"] = "FALSE"
                row["SEO Title"] = f'{p["title"]} ({p["ar"]}) | Miko Foods'
                row["SEO Description"] = f'Buy {p["title"]} — halal, fresh daily, same-day delivery across Cairo. Miko Foods.'
                row["Status"] = "draft" if p["draft"] else "active"
                row["Metafield: miko.name_ar [single_line_text_field]"] = p["ar"]
                row["Metafield: miko.weight_label [single_line_text_field]"] = p["weight"]
                row["Metafield: miko.prep_methods [list.single_line_text_field]"] = prep_json
                row["Metafield: miko.quality_tags [list.single_line_text_field]"] = qual_json
            w.writerow(row); rows += 1

print(f"Wrote {out_path}")
print(f"Products: {len(P)}  |  CSV rows (incl. variants): {rows}")
draft = sum(1 for p in P if p['draft'])
print(f"Active: {len(P)-draft}  |  Draft (lamb — need prices): {draft}")
