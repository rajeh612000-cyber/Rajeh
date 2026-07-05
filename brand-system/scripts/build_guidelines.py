#!/usr/bin/env python3
"""Assemble a self-contained guidelines.html: brand book for Smart Value(TM).

Inlines Sora (data URIs), the isometric symbol (SVG) and compressed template
previews so the page works anywhere — committed in the repo or shared as a link.
"""
import base64, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(w): return b64(os.path.join(ROOT, f'assets/fonts/Sora-{w}.ttf'))
symbol = open(os.path.join(ROOT, 'assets/logo/symbol.svg')).read().strip()

# ---- compressed inline previews -------------------------------------------
GALLERY = [
    ('article-blog',     'Blog / link share',      '1200 × 627'),
    ('stat-margin',      'Single statistic',       '1200 × 627'),
    ('quote-elmasry',    'Quote / testimonial',    '1200 × 627'),
    ('announce-webinar', 'Announcement',           '1200 × 627'),
    ('webinar-169',      'Webinar · 16:9',         '1280 × 720'),
    ('insight-promos',   'Insight · square',       '1080 × 1080'),
]
def preview_uri(name, width=760, q=74):
    im = Image.open(os.path.join(ROOT, 'out', f'{name}.png')).convert('RGB')
    r = width / im.width
    im = im.resize((width, round(im.height * r)))
    tmp = f'/tmp/_gv_{name}.jpg'
    im.save(tmp, 'JPEG', quality=q, optimize=True)
    return 'data:image/jpeg;base64,' + b64(tmp)

cards = []
for name, label, size in GALLERY:
    cards.append(f'''      <figure class="shot">
        <img src="{preview_uri(name)}" alt="{label} template" width="760">
        <figcaption><span>{label}</span><span class="dim">{size}</span></figcaption>
      </figure>''')
gallery = '\n'.join(cards)

swatches = [
    ('Navy', '#1A1A4E', 'Dominant · backgrounds', 'dark'),
    ('Purple', '#7751FF', 'Accent · highlights', 'dark'),
    ('Amber', '#F19526', 'CTA · action only', 'light'),
    ('Ice Blue', '#E8F3FE', 'Light fields · space', 'light'),
    ('Deep Navy', '#0E337B', 'Gradient depth', 'dark'),
    ('Growth', '#61CE70', 'Growth only · rare', 'light'),
]
swatch_html = '\n'.join(
    f'''      <div class="swatch">
        <div class="chip" style="background:{hexv}"></div>
        <div class="meta"><b>{n}</b><code>{hexv}</code><span>{role}</span></div>
      </div>''' for n, hexv, role, _ in swatches)

scale = [
    ('Display', '40 / 800', 'font:800 40px/1 var(--f)', 'Better decisions'),
    ('Title', '32 / 800', 'font:800 32px/1 var(--f)', 'Find the cell where margin compounds'),
    ('Subhead', '20 / 600', 'font:600 20px/1.2 var(--f)', 'What Smart Value™ stands for'),
    ('Body', '16 / 400', 'font:400 16px/1.5 var(--f)', 'Turns pricing, promotion and pack architecture into clear, confident decisions — every day.'),
    ('Caption', '12 / 500', 'font:500 12px/1.4 var(--f);letter-spacing:.06em', '— Smart Value™ RGM benchmark, 2026'),
]
scale_html = '\n'.join(
    f'''      <div class="scale-row">
        <div class="scale-tag"><b>{n}</b><span>{spec}</span></div>
        <div class="scale-demo" style="{css}">{sample}</div>
      </div>''' for n, spec, css, sample in scale)

lockup = f'''<span class="lockup"><span class="sym">{symbol}</span>
      <span class="word"><span class="name">SMART<br>VALUE<sup>™</sup></span><span class="desc">AI SOLUTIONS</span></span></span>'''

HTML = r'''<title>Smart Value™ — Brand Guidelines</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  @font-face{font-family:'Sora';font-weight:400;font-display:swap;src:url(data:font/ttf;base64,__F400__) format('truetype')}
  @font-face{font-family:'Sora';font-weight:700;font-display:swap;src:url(data:font/ttf;base64,__F700__) format('truetype')}
  @font-face{font-family:'Sora';font-weight:800;font-display:swap;src:url(data:font/ttf;base64,__F800__) format('truetype')}
  :root{
    --navy:#1A1A4E; --deep:#0E337B; --purple:#7751FF; --purple-lt:#9280F4;
    --amber:#F19526; --ice:#E8F3FE; --white:#fff; --green:#61CE70;
    --muted:#9AA6C7; --line:rgba(146,128,244,.20);
    --f:'Sora',system-ui,sans-serif;
    --ink:#EAEDFA;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth;background:#101030}
  body{font-family:var(--f);color:var(--ink);-webkit-font-smoothing:antialiased;min-height:100vh;
    background:
      radial-gradient(1200px 700px at 18% 0, #26265F 0%, rgba(38,38,95,0) 60%),
      radial-gradient(1000px 640px at 100% 60px, #3A2A78 0%, rgba(58,42,120,0) 55%),
      linear-gradient(180deg,#181842 0%,#141438 40%,#101030 100%);
    background-repeat:no-repeat;background-color:#101030;}
  .wrap{max-width:1120px;margin:0 auto;padding:0 40px}
  ::selection{background:rgba(119,81,255,.4)}

  /* ---- logo lockup ---- */
  .lockup{display:inline-flex;align-items:center;gap:20px;vertical-align:middle}
  .lockup .sym{width:var(--s,86px);display:inline-flex;filter:drop-shadow(0 6px 16px rgba(0,0,0,.3))}
  .lockup .sym svg{width:100%;height:auto;display:block}
  .lockup .word{display:flex;flex-direction:column;line-height:1}
  .lockup .name{font-weight:800;font-size:var(--w,34px);line-height:.9;color:var(--white)}
  .lockup .name sup{font-size:.42em;font-weight:700;vertical-align:super}
  .lockup .desc{font-weight:400;font-size:var(--d,11px);letter-spacing:.4em;
    color:var(--white);opacity:.9;margin-top:.6em;padding-left:.14em}

  /* ---- top bar ---- */
  .bar{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);
    background:rgba(16,16,42,.62);border-bottom:1px solid var(--line)}
  .bar .wrap{display:flex;align-items:center;justify-content:space-between;height:76px}
  .bar .tag{font-weight:600;font-size:12px;letter-spacing:.24em;color:var(--purple-lt);text-transform:uppercase}

  /* ---- hero ---- */
  .hero{padding:112px 0 96px}
  .hero-grid{display:grid;grid-template-columns:auto 2px 1fr;gap:52px;align-items:center}
  .divider-v{width:2px;align-self:stretch;min-height:230px;border-radius:2px;
    background:linear-gradient(180deg,#4B8DF8,#6A63E6 42%,#8E5CC8 68%,#F19526);
    box-shadow:0 0 16px rgba(123,110,240,.45)}
  .hero h1{font-weight:800;font-size:clamp(40px,6.4vw,78px);line-height:1.0;letter-spacing:-.01em;text-wrap:balance}
  .hero h1 .p{color:var(--purple-lt)}
  .hero p{margin-top:22px;max-width:52ch;color:var(--muted);font-size:19px;line-height:1.55}
  .hero .lede{color:#C9D0EA}

  /* ---- section scaffold ---- */
  section{padding:64px 0;border-top:1px solid var(--line)}
  .eyebrow{display:flex;align-items:center;gap:14px;margin-bottom:30px}
  .eyebrow .num{font-weight:800;font-size:13px;color:var(--amber);letter-spacing:.1em}
  .eyebrow .ttl{font-weight:600;font-size:13px;letter-spacing:.28em;text-transform:uppercase;color:var(--purple-lt)}
  h2{font-weight:800;font-size:clamp(28px,3.6vw,42px);line-height:1.08;letter-spacing:-.01em;margin-bottom:18px;text-wrap:balance;color:#F4F6FF}
  .lead{color:#C4CBE6;font-size:19px;line-height:1.6;max-width:64ch}
  .lead b{color:var(--white);font-weight:700}
  .lead .p{color:var(--purple-lt);font-weight:600}

  /* ---- brand stats ---- */
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px}
  .stat{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:18px;padding:28px}
  .stat b{display:block;font-weight:800;font-size:48px;color:var(--white);line-height:1}
  .stat span{display:block;margin-top:10px;color:var(--muted);font-size:15px;line-height:1.4}
  .stat .u{color:var(--purple-lt)}

  /* ---- positioning pillars ---- */
  .pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:38px}
  .pillar{background:linear-gradient(180deg,rgba(119,81,255,.10),rgba(119,81,255,.02));
    border:1px solid var(--line);border-radius:18px;padding:30px}
  .pillar .n{font-weight:800;font-size:15px;color:var(--amber);margin-bottom:16px}
  .pillar h3{font-weight:800;font-size:21px;color:var(--white);margin-bottom:10px;letter-spacing:-.01em}
  .pillar p{color:var(--muted);font-size:15.5px;line-height:1.55}

  /* ---- logo system ---- */
  .logos{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:34px}
  .logo-card{border-radius:20px;padding:52px 44px;display:flex;flex-direction:column;gap:22px;justify-content:space-between;min-height:230px;border:1px solid var(--line)}
  .logo-card.dark{background:linear-gradient(160deg,#1C1C52,#12122f)}
  .logo-card.light{background:linear-gradient(160deg,#F4F8FE,#E1ECFB)}
  .logo-card .cap{font-weight:600;font-size:12px;letter-spacing:.2em;text-transform:uppercase}
  .logo-card.dark .cap{color:var(--purple-lt)}
  .logo-card.light .cap{color:#5A5F86}
  .logo-card.light .name{color:#1A1A4E}
  .logo-card.light .name sup,.logo-card.light .v{color:#7751FF}
  .logo-card.light .desc{color:#3A3A6B;opacity:.85}
  .dont{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px}
  .dont div{display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:14.5px;line-height:1.4}
  .dont .x{color:#FF6B6B;font-weight:800;flex:none}

  /* ---- colour ---- */
  .swatches{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}
  .swatch{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:16px;overflow:hidden}
  .swatch .chip{height:96px}
  .swatch .meta{padding:16px 18px;display:flex;flex-direction:column;gap:3px}
  .swatch .meta b{font-weight:700;font-size:16px;color:var(--white)}
  .swatch .meta code{font-family:var(--f);font-weight:500;font-size:13px;color:var(--purple-lt);letter-spacing:.02em}
  .swatch .meta span{font-size:13px;color:var(--muted)}
  .balance{margin-top:22px;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.03)}
  .bar-row{display:flex;height:52px;font-weight:700;font-size:14px}
  .bar-row>div{display:flex;align-items:center;padding-left:16px;color:#fff;white-space:nowrap;overflow:hidden}
  .bl-legend{display:flex;flex-wrap:wrap;gap:18px 26px;padding:16px 18px;border-top:1px solid var(--line);color:var(--muted);font-size:13.5px}
  .bl-legend b{color:var(--ink)}

  /* ---- typography ---- */
  .type{margin-top:30px;border:1px solid var(--line);border-radius:20px;overflow:hidden}
  .scale-row{display:grid;grid-template-columns:150px 1fr;gap:24px;padding:22px 26px;align-items:center;border-bottom:1px solid var(--line)}
  .scale-row:last-child{border-bottom:0}
  .scale-tag b{display:block;font-weight:700;font-size:15px;color:var(--white)}
  .scale-tag span{font-size:12.5px;color:var(--muted)}
  .scale-demo{color:var(--ink);overflow:hidden;text-overflow:ellipsis}
  .specimen{margin-top:18px;display:flex;flex-wrap:wrap;gap:14px}
  .weight{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;padding:16px 20px;flex:1;min-width:150px}
  .weight .g{font-size:40px;color:var(--white);line-height:1}
  .weight .l{font-size:12.5px;color:var(--muted);margin-top:8px}
  .pangram{margin-top:14px;color:var(--muted);font-size:15px}

  /* ---- motif ---- */
  .motif{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:34px}
  .motif-card{background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:18px;padding:34px;min-height:200px;position:relative;overflow:hidden}
  .motif-card h3{font-weight:700;font-size:18px;margin-bottom:8px;color:var(--white)}
  .motif-card p{color:var(--muted);font-size:15px;line-height:1.5}
  .demo-v{position:absolute;right:40px;top:34px;bottom:34px;width:3px;border-radius:3px;
    background:linear-gradient(180deg,#4B8DF8,#7751FF 50%,#F19526)}
  .demo-h{height:3px;border-radius:3px;margin:22px 0 4px;
    background:linear-gradient(90deg,#4B8DF8,#7751FF 46%,#B36BB0 72%,#F19526)}
  .cta-demo{display:inline-flex;margin-top:20px;background:var(--amber);color:var(--navy);
    font-weight:700;font-size:15px;padding:11px 24px;border-radius:999px}

  /* ---- gallery ---- */
  .grid{column-count:2;column-gap:22px;margin-top:34px}
  .shot{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#10102c;
    break-inside:avoid;margin-bottom:22px;
    transition:transform .25s ease,box-shadow .25s ease}
  .shot:hover{transform:translateY(-4px);box-shadow:0 20px 46px rgba(0,0,0,.4)}
  .shot img{width:100%;display:block}
  .shot figcaption{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;
    font-size:14px;color:var(--ink);border-top:1px solid var(--line)}
  .shot .dim{color:var(--muted);font-size:12.5px;font-variant-numeric:tabular-nums}

  /* ---- footer ---- */
  footer{border-top:1px solid var(--line);padding:56px 0 80px;margin-top:20px}
  .rules{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 40px;margin:28px 0 40px}
  .rule{display:flex;gap:12px;color:#C4CBE6;font-size:15.5px;line-height:1.5}
  .rule .d{color:var(--amber);font-weight:800;flex:none}
  .sign{color:var(--muted);font-size:14px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;
    border-top:1px solid var(--line);padding-top:24px}
  .sign b{color:var(--ink)}

  @media (max-width:820px){
    .wrap{padding:0 22px}
    .hero-grid{grid-template-columns:1fr;gap:30px}
    .divider-v{display:none}
    .stats,.pillars,.swatches,.logos,.motif,.grid,.rules{grid-template-columns:1fr}
    .dont{grid-template-columns:1fr}
    .scale-row{grid-template-columns:1fr;gap:8px}
    .bar-row{font-size:11px}
  }
  @media (prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto}}
</style>

<header class="bar"><div class="wrap">
  __LOCKUP_SM__
  <span class="tag">Brand Guidelines · v1.0</span>
</div></header>

<div class="wrap">
  <section class="hero" style="border:0">
    <div class="hero-grid">
      __LOCKUP_HERO__
      <div class="divider-v"></div>
      <div>
        <h1>Better decisions,<br><span class="p">not more data.</span></h1>
        <p class="lede">The visual identity system for Smart Value™ — an AI-powered Revenue
          Growth Management platform for FMCG. One logo, one palette, one typeface,
          one signature line — sized to every place the brand shows up.</p>
      </div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">01</span><span class="ttl">The brand</span></div>
    <h2>Decisions over dashboards.</h2>
    <p class="lead">Smart Value™ turns <b>pricing, promotions, pack architecture, assortment,
      trade efficiency and forecasting</b> into clear, confident calls — every day. Where most
      tools drown teams in dashboards, Smart Value™ delivers <span class="p">the answer</span>:
      priced, planned and ready to act on.</p>
    <div class="stats">
      <div class="stat"><b>6<span class="u">+</span></b><span>RGM decision domains</span></div>
      <div class="stat"><b>2</b><span>priority regions · ME &amp; Europe</span></div>
      <div class="stat"><b>1</b><span>platform, every decision</span></div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">02</span><span class="ttl">Positioning</span></div>
    <h2>What Smart Value™ stands for.</h2>
    <div class="pillars">
      <div class="pillar"><div class="n">01</div><h3>Decisions over dashboards</h3>
        <p>We don't add another report. We deliver the answer — priced, planned and ready to act on.</p></div>
      <div class="pillar"><div class="n">02</div><h3>Built for FMCG RGM</h3>
        <p>Purpose-built for the realities of pricing, promo, pack and assortment in fast-moving goods.</p></div>
      <div class="pillar"><div class="n">03</div><h3>Confidence at speed</h3>
        <p>AI diagnostics and simulations replace gut-feel and static spreadsheets with fast, defensible calls.</p></div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">03</span><span class="ttl">Logo system</span></div>
    <h2>Two versions, one mark.</h2>
    <p class="lead">The mark pairs an <b>isometric symbol</b> — structured decisions emerging from
      connected data — with the wordmark and the AI&nbsp;Solutions descriptor. Use the
      <span class="p">reversed</span> mark on dark grounds, the <b>primary</b> mark on light.</p>
    <div class="logos">
      <div class="logo-card dark"><span class="cap">Reversed — for dark</span>
        <span class="lockup" style="--s:78px;--w:30px;--d:10px">__SYM__
          <span class="word"><span class="name">SMART<br>VALUE<sup>™</sup></span><span class="desc">AI SOLUTIONS</span></span></span></div>
      <div class="logo-card light"><span class="cap">Primary — for light</span>
        <span class="lockup" style="--s:78px;--w:30px;--d:10px">__SYM__
          <span class="word"><span class="name" style="color:#1A1A4E">SMART<br><span class="v" style="color:#7751FF">VALUE</span><sup>™</sup></span><span class="desc">AI SOLUTIONS</span></span></span></div>
    </div>
    <div class="dont">
      <div><span class="x">✕</span> Don't recolour the mark or symbol</div>
      <div><span class="x">✕</span> Don't stretch or distort it</div>
      <div><span class="x">✕</span> Don't rotate or tilt the mark</div>
      <div><span class="x">✕</span> Don't add shadows or effects</div>
      <div><span class="x">✕</span> Don't place on low-contrast grounds</div>
      <div><span class="x">✕</span> Don't rearrange symbol &amp; wordmark</div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">04</span><span class="ttl">Colour palette</span></div>
    <h2>Navy leads. Purple accents. Amber signals action.</h2>
    <p class="lead">A dominant navy foundation keeps the brand premium. Let purple and amber
      punctuate — never compete. <span class="p">Green appears rarely</span>, only for growth.</p>
    <div class="swatches">
__SWATCHES__
    </div>
    <div class="balance">
      <div class="bar-row">
        <div style="background:#1A1A4E;flex:60">Navy · 60%</div>
        <div style="background:#E8F3FE;flex:25;color:#1A1A4E">Ice / White · 25%</div>
        <div style="background:#7751FF;flex:12">12%</div>
        <div style="background:#F19526;flex:3;padding-left:6px" title="Amber 3%"></div>
      </div>
      <div class="bl-legend">
        <span><b>~60%</b> Navy — backgrounds &amp; large fields</span>
        <span><b>~25%</b> Ice &amp; white — breathing room</span>
        <span><b>~12%</b> Purple — accents &amp; emphasis</span>
        <span><b>~3%</b> Amber — the single CTA only</span>
      </div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">05</span><span class="ttl">Typography</span></div>
    <h2>Sora — one family, every weight.</h2>
    <p class="lead">A geometric sans with the clean, engineered feel of an AI product. Emphasise
      key words and stats in <span class="p">purple</span> for fast readability.</p>
    <div class="specimen">
      <div class="weight"><div class="g" style="font-weight:800">Aa</div><div class="l">ExtraBold 800 · display</div></div>
      <div class="weight"><div class="g" style="font-weight:700">Aa</div><div class="l">Bold 700 · headlines</div></div>
      <div class="weight"><div class="g" style="font-weight:400">Aa</div><div class="l">Regular 400 · body</div></div>
    </div>
    <div class="type">
__SCALE__
    </div>
    <p class="pangram">The quick brown fox jumps over the lazy dog · 0123456789</p>
  </section>

  <section>
    <div class="eyebrow"><span class="num">06</span><span class="ttl">Design motif</span></div>
    <h2>The signature divider line.</h2>
    <p class="lead">A gradient line — blue flowing into purple into amber — carries the brand's
      spectrum and separates the logo from the message across every asset.</p>
    <div class="motif">
      <div class="motif-card"><div class="demo-v"></div>
        <h3>Vertical — landscape</h3>
        <p>Splits the reversed logo from the headline on link shares, blog covers and event cards.</p></div>
      <div class="motif-card">
        <h3>Horizontal — square &amp; portrait</h3>
        <p>Sits under the logo lockup on insight cards and carousels. Amber is reserved for one action.</p>
        <div class="demo-h"></div>
        <span class="cta-demo">Read the full article</span></div>
    </div>
  </section>

  <section>
    <div class="eyebrow"><span class="num">07</span><span class="ttl">Applications</span></div>
    <h2>Templates in the wild.</h2>
    <p class="lead">Every asset uses the same logo lockup, divider line, palette and Sora type —
      sized to current platform specs. <b>One system, many formats.</b> Only the message and
      format change.</p>
    <div class="grid">
__GALLERY__
    </div>
  </section>

  <footer>
    <div class="eyebrow"><span class="num">08</span><span class="ttl">The rules</span></div>
    <h2>Keep it unmistakable.</h2>
    <div class="rules">
      <div class="rule"><span class="d">→</span> Navy leads; purple accents; amber signals a single action only.</div>
      <div class="rule"><span class="d">→</span> One amber CTA per asset — a rounded pill with a navy label.</div>
      <div class="rule"><span class="d">→</span> Sora only, across every weight. Emphasise key words in purple.</div>
      <div class="rule"><span class="d">→</span> Reversed logo on navy; primary logo on light.</div>
      <div class="rule"><span class="d">→</span> Headlines stay 2–3 lines. Decisions, not paragraphs.</div>
      <div class="rule"><span class="d">→</span> Illustration follows the logo's isometric geometry.</div>
    </div>
    <div class="sign">
      <span><b>Smart Value™</b> AI Solutions — visual identity system</span>
      <span>Version 1.0 · 2026</span>
    </div>
  </footer>
</div>
'''

HTML = (HTML
        .replace('__F400__', font(400))
        .replace('__F700__', font(700))
        .replace('__F800__', font(800))
        .replace('__LOCKUP_SM__', '<span class="lockup" style="--s:44px;--w:18px;--d:7px;gap:12px">' + symbol +
                 '<span class="word"><span class="name">SMART<br>VALUE<sup>™</sup></span><span class="desc">AI SOLUTIONS</span></span></span>')
        .replace('__LOCKUP_HERO__', '<span class="lockup" style="--s:118px;--w:46px;--d:14px;gap:26px">' + symbol +
                 '<span class="word"><span class="name">SMART<br>VALUE<sup>™</sup></span><span class="desc">AI SOLUTIONS</span></span></span>')
        .replace('__SYM__', '<span class="sym">' + symbol + '</span>')
        .replace('__SWATCHES__', swatch_html)
        .replace('__SCALE__', scale_html)
        .replace('__GALLERY__', gallery))

out = os.path.join(ROOT, 'guidelines.html')
open(out, 'w').write(HTML)
print(f'wrote guidelines.html  ({len(HTML)/1024:.0f} KB)')
