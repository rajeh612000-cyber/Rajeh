"""Render the Episode 1 featured image and Vimeo thumbnail from thumbnail.html.

Checks that Sora actually loaded (not a fallback), writes sRGB JPGs at quality
85 with an embedded sRGB profile, and a 400px-wide preview of the featured
image for the legibility check.
"""
import io, sys, pathlib, threading, functools, http.server
from PIL import Image, ImageCms
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
DRAFT = "--draft" in sys.argv
SIZES = {
    "featured": (1200, 630, "hitl-ep1-featured-1200x630.jpg"),
    "vimeo":    (1920, 1080, "hitl-ep1-vimeo-1920x1080.jpg"),
}
# Serve this folder over localhost: Chrome blocks web fonts across file:// URLs.
_handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(HERE))
http.server.SimpleHTTPRequestHandler.log_message = lambda *a: None
_srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), _handler)
threading.Thread(target=_srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{_srv.server_address[1]}/"

SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
                                args=["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    for key, (w, h, out) in SIZES.items():
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        url = BASE + f"thumbnail.html?size={key}" + ("&draft=1" if DRAFT else "")
        page.goto(url, wait_until="networkidle")
        page.wait_for_function("window.__ready === true")
        page.evaluate("document.fonts.ready")
        loaded = page.evaluate("""[...document.fonts]
            .filter(f => f.family.replace(/["']/g,'') === 'Sora' && f.status === 'loaded')
            .map(f => f.weight)""")
        if not loaded:
            sys.exit("Sora did not load; refusing to render with a fallback font.")
        family = page.evaluate("getComputedStyle(document.querySelector('h1')).fontFamily")
        lines = page.evaluate("""(() => { const h = document.querySelector('h1');
            return Math.round(h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight)); })()""")
        png = page.locator("#canvas").screenshot()
        im = Image.open(io.BytesIO(png)).convert("RGB")
        assert im.size == (w, h), im.size
        name = ("draft-" + out) if DRAFT else out
        im.save(HERE / name, "JPEG", quality=85, optimize=True, progressive=True, icc_profile=SRGB)
        kb = (HERE / name).stat().st_size / 1024
        print(f"{name}: {im.size[0]}x{im.size[1]}, {kb:.0f} KB | Sora weights loaded {sorted(set(loaded))} | h1 font {family} | headline lines {lines}")
        if key == "featured":
            prev = im.resize((400, round(400 * h / w)), Image.LANCZOS)
            prev.save(HERE / ("draft-preview-400.jpg" if DRAFT else "preview-400.jpg"), quality=90)
        page.close()
    browser.close()
