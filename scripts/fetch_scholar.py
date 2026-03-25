#!/usr/bin/env python3
"""
fetch_scholar.py
────────────────
Fetches citation metrics from Google Scholar for Dr. Ashish Kumar
and saves them to data/scholar_metrics.json.

Run automatically by GitHub Actions weekly (see .github/workflows/update_scholar.yml).
Can also be run manually:  python scripts/fetch_scholar.py

Methods tried in order:
  1. scholarly  (pip install scholarly)  — cleanest, uses official Scholar scraper
  2. Direct HTTP request + regex fallback

On failure the existing JSON is kept untouched so the site always shows the last
known values rather than going blank.
"""

import json
import os
import sys
import datetime
import re

SCHOLAR_ID  = "eSKL8HgAAAAJ"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "scholar_metrics.json")
OUTPUT_FILE = os.path.normpath(OUTPUT_FILE)

PROFILE_URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"


# ──────────────────────────────────────────────
# Method 1 — scholarly
# ──────────────────────────────────────────────
def fetch_with_scholarly():
    from scholarly import scholarly as sch
    print("  [scholarly] searching author id …")
    author = sch.search_author_id(SCHOLAR_ID)
    sch.fill(author, sections=["basics", "counts"])

    h   = int(author.get("hindex",   0))
    i10 = int(author.get("i10index", 0))
    cit = int(author.get("citedby",  0))

    # Publications: prefer filled list, fall back to existing JSON
    pubs = None
    try:
        sch.fill(author, sections=["publications"])
        pub_list = author.get("publications", [])
        if pub_list:
            pubs = len(pub_list)
    except Exception:
        pass

    return {"h_index": h, "i10_index": i10, "citations": cit, "publications": pubs}


# ──────────────────────────────────────────────
# Method 2 — direct HTTP request + HTML parsing
# ──────────────────────────────────────────────
def fetch_with_requests():
    import urllib.request

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    print(f"  [requests] fetching {PROFILE_URL} …")
    req = urllib.request.Request(PROFILE_URL, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    # Google Scholar citation table rows look like:
    #   <td class="gsc_rsb_std">1234</td>
    # The table order is: citations_all | citations_5yr | h-index_all | h-index_5yr | i10_all | i10_5yr
    values = re.findall(r'<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)</td>', html)
    print(f"  [requests] found values: {values}")

    if len(values) < 5:
        raise ValueError(f"Unexpected Scholar HTML — only {len(values)} values found")

    return {
        "citations":  int(values[0]),
        "h_index":    int(values[2]),
        "i10_index":  int(values[4]),
        "publications": None,            # can't reliably count from this view
    }


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
def load_existing():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE) as f:
            return json.load(f)
    return {}


def save(metrics: dict):
    existing = load_existing()

    final = {
        "publications": metrics.get("publications") or existing.get("publications", 78),
        "h_index":      metrics.get("h_index")      or existing.get("h_index",     26),
        "i10_index":    metrics.get("i10_index")     or existing.get("i10_index",   39),
        "citations":    metrics.get("citations")     or existing.get("citations", 1680),
        "last_updated": datetime.date.today().isoformat(),
        "source":       "Google Scholar",
        "profile_url":  PROFILE_URL,
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(final, f, indent=2)

    print(f"\n✅  Saved to {OUTPUT_FILE}:")
    print(json.dumps(final, indent=2))
    return final


def main():
    metrics = None

    # Try Method 1
    try:
        metrics = fetch_with_scholarly()
        print(f"  scholarly result: {metrics}")
    except Exception as e:
        print(f"  scholarly failed: {e}")

    # Try Method 2 if Method 1 failed
    if not metrics:
        try:
            metrics = fetch_with_requests()
            print(f"  requests result: {metrics}")
        except Exception as e:
            print(f"  requests failed: {e}")

    if not metrics:
        print("\n⚠️  All fetch methods failed — keeping existing JSON unchanged.")
        sys.exit(0)   # exit 0 so the GitHub Action doesn't mark as failed

    save(metrics)


if __name__ == "__main__":
    main()
