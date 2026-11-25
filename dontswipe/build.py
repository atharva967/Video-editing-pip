"""Inline peeps/*.svg into slides.tpl.html -> slides.html, then screenshot each slide to out/slide-N.png."""
import re, subprocess, pathlib
here = pathlib.Path(__file__).parent
tpl = (here / "slides.tpl.html").read_text()
def peep(m):
    name, *opts = m.group(1).split(":")
    kv = dict(o.split("=") for o in opts)
    svg = (here / "peeps" / f"{name}.svg").read_text()
    attrs = " ".join(f'data-{k}="{v}"' for k, v in kv.items())
    return re.sub(r"^<svg ", f'<svg class="peep" {attrs} ', svg, count=1)
html = re.sub(r"\{\{peep:([^}]+)\}\}", peep, tpl)
(here / "slides.html").write_text(html)
chrome = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
(here / "out").mkdir(exist_ok=True)
n = html.count('<section class="slide"')
for i in range(1, n + 1):
    subprocess.run([chrome, "--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1",
                    "--window-size=1080,1350", "--virtual-time-budget=3000",
                    f"--screenshot={here.resolve()}/out/slide-{i}.png", f"file://{here.resolve()}/slides.html?s={i}"],
                   stderr=subprocess.DEVNULL, check=True)
print("rendered", n)
