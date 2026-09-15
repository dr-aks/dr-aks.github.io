#!/usr/bin/env python3
"""
fetch_metrics.py — publication and citation metrics from three sources.

  Google Scholar   h-index, i10-index, citations, indexed item count   (scraped)
  ORCID            works total and journal-article count               (public API, no key)
  Web of Science   document count and times-cited                      (needs WOS_API_KEY)

Writes data/metrics.json. Each field carries the source it came from, so the
page can say where a number originated instead of asserting one blended total.

Design notes
------------
* Every source is optional. A source that fails leaves its previous values in
  place rather than blanking them, so the site never regresses to zero.
* The script exits NON-ZERO when every source fails. The previous version
  swallowed all errors and exited 0, so a silently broken weekly run looked
  green in the Actions tab for weeks. Failing loudly is the point.
* data/scholar_metrics.json is still written, for backwards compatibility with
  anything that already reads it.

Usage:  python scripts/fetch_metrics.py
Env:    WOS_API_KEY  (optional) Clarivate Web of Science Starter API key
"""

import datetime
import json
import random
import os
import re
import sys
import time
import urllib.error
import urllib.request

SCHOLAR_ID = "eSKL8HgAAAAJ"
ORCID_ID   = "0000-0002-5240-3472"

HERE     = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.normpath(os.path.join(HERE, "..", "data"))
OUT      = os.path.join(DATA_DIR, "metrics.json")
OUT_LEGACY = os.path.join(DATA_DIR, "scholar_metrics.json")

SCHOLAR_URL = "https://scholar.google.com/citations?user=%s&hl=en&cstart=0&pagesize=100" % SCHOLAR_ID
ORCID_URL   = "https://pub.orcid.org/v3.0/%s/works" % ORCID_ID
WOS_URL     = ("https://api.clarivate.com/apis/wos-starter/v1/documents"
               "?q=AI%3D" + ORCID_ID + "&limit=1")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def get(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")


def get_with_retry(url, headers=None, attempts=4, timeout=30):
    """Google rate-limits GitHub Actions IP ranges hard, so a single 403 is not
    a real failure — it is the runner's address being unlucky. Retry a few times
    with growing, jittered gaps before giving up."""
    last = None
    for i in range(attempts):
        try:
            return get(url, headers=headers, timeout=timeout)
        except Exception as exc:                      # noqa: BLE001
            last = exc
            if i < attempts - 1:
                delay = (2 ** i) * 15 + random.randint(0, 20)
                print("    attempt %d/%d failed (%s) — retrying in %ds"
                      % (i + 1, attempts, exc, delay))
                time.sleep(delay)
    raise last


# ── Google Scholar ────────────────────────────────────────────────────────────
def fetch_scholar():
    html = get_with_retry(SCHOLAR_URL, {"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    if re.search(r"/sorry/|unusual traffic|captcha", html, re.I):
        raise RuntimeError("Scholar served a CAPTCHA (the runner's IP is rate-limited)")

    # Summary table order: citations_all, citations_5y, h_all, h_5y, i10_all, i10_5y
    vals = re.findall(r'<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)</td>', html)
    if len(vals) < 5:
        raise RuntimeError("unexpected Scholar markup — %d summary values" % len(vals))

    titles = re.findall(r'class="gsc_a_at"[^>]*>([^<]{3,})<', html)
    items = len(dict.fromkeys(titles)) or None

    return {
        "citations":  int(vals[0]),
        "h_index":    int(vals[2]),
        "i10_index":  int(vals[4]),
        "scholar_items": items,
    }


# ── ORCID ─────────────────────────────────────────────────────────────────────
def fetch_orcid():
    data = json.loads(get(ORCID_URL, {"Accept": "application/json", "User-Agent": UA}))
    groups = data.get("group") or []
    if not groups:
        raise RuntimeError("ORCID returned no work groups")

    journal = 0
    for g in groups:
        summaries = g.get("work-summary") or []
        if summaries and (summaries[0].get("type") or "") == "journal-article":
            journal += 1

    return {"orcid_works": len(groups), "orcid_journal_articles": journal}


# ── Web of Science (optional) ────────────────────────────────────────────────
def fetch_wos():
    key = os.environ.get("WOS_API_KEY", "").strip()
    if not key:
        raise RuntimeError("WOS_API_KEY not set — skipping Web of Science")

    raw = get(WOS_URL, {"X-ApiKey": key, "Accept": "application/json", "User-Agent": UA})
    data = json.loads(raw)
    total = (data.get("metadata") or {}).get("total")
    if total is None:
        raise RuntimeError("no 'metadata.total' in the Web of Science response")
    return {"wos_documents": int(total)}


# ── main ──────────────────────────────────────────────────────────────────────
def load_previous():
    if os.path.exists(OUT):
        try:
            with open(OUT) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def main():
    previous = load_previous()
    today = datetime.date.today().isoformat()

    merged = {}
    sources = {}
    failures = []

    for name, fn in (("scholar", fetch_scholar), ("orcid", fetch_orcid), ("wos", fetch_wos)):
        try:
            got = fn()
            merged.update({k: v for k, v in got.items() if v is not None})
            sources[name] = {"status": "ok", "fetched": today}
            print("  %-8s ok   %s" % (name, got))
        except Exception as exc:                     # noqa: BLE001 — report, don't crash
            failures.append(name)
            prev_src = (previous.get("sources") or {}).get(name, {})
            sources[name] = {
                "status": "failed",
                "error": str(exc)[:200],
                "last_ok": prev_src.get("fetched") or prev_src.get("last_ok"),
            }
            print("  %-8s FAIL %s" % (name, exc))

    if len(failures) == 3:
        print("\nEvery source failed. Leaving data/metrics.json untouched.")
        sys.exit(1)                                   # surface it in the Actions tab

    out = {k: v for k, v in previous.items() if k not in ("sources", "last_updated")}
    out.update(merged)                                # only successful fields overwrite
    out["last_updated"] = today
    out["sources"] = sources
    out["profiles"] = {
        "scholar": "https://scholar.google.com/citations?user=%s" % SCHOLAR_ID,
        "orcid":   "https://orcid.org/%s" % ORCID_ID,
    }

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(out, f, indent=2)
        f.write("\n")

    legacy = {
        "publications": out.get("scholar_items"),
        "h_index":      out.get("h_index"),
        "i10_index":    out.get("i10_index"),
        "citations":    out.get("citations"),
        "last_updated": today,
        "source":       "Google Scholar",
        "profile_url":  out["profiles"]["scholar"],
    }
    with open(OUT_LEGACY, "w") as f:
        json.dump({k: v for k, v in legacy.items() if v is not None}, f, indent=2)
        f.write("\n")

    print("\nWrote %s" % OUT)
    print(json.dumps(out, indent=2))

    if failures:
        print("\nPartial success — failed sources: %s" % ", ".join(failures))


if __name__ == "__main__":
    main()
