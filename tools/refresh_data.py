#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Weekly refresh of the site's publication data.

Two sources, each doing the job it is actually good at:

  Google Scholar  ->  the headline figures (item count, citations, h-index,
                      i10-index). Scholar has no API, so this parses the public
                      profile page. It is the only source that carries the
                      citation figures the site quotes.

  ORCID           ->  the publication list. This is the record the author
                      curates, so it is what the list on publications.html is
                      built from, both as data/works.json and as the offline
                      fallback compiled into assets/js/pubs.js.

The two disagree by design: Scholar folds in preprints, book chapters and
duplicate records, so its item count runs ahead of the curated ORCID list.

FAILURE POLICY. Scholar blocks automated requests from datacenter addresses
often enough that a failed run must be routine, not an incident. Nothing is
ever overwritten with a zero or a blank: if a source fails, the previous value
is kept and the run is recorded as failed in metrics.json, with last_ok showing
how stale the figure is. The script therefore exits 0 even when a source is
unreachable -- a red workflow badge every other week teaches people to ignore
the badge.
"""
import io, json, os, re, sys, time, datetime, urllib.request, urllib.error

ORCID_ID  = "0000-0002-5240-3472"
SCHOLAR_ID = "eSKL8HgAAAAJ"
CONTACT   = "ashish.phy@cujammu.ac.in"

ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKS    = os.path.join(ROOT, "data", "works.json")
METRICS  = os.path.join(ROOT, "data", "metrics.json")
PUBS_JS  = os.path.join(ROOT, "assets", "js", "pubs.js")
PAGES    = ("index.html", "publications.html", "people.html", "about.html",
            "research.html", "news.html", "resources.html")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36")
TODAY = datetime.date.today().isoformat()


def get(url, headers=None, timeout=45):
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


# ───────────────────────────── ORCID ──────────────────────────────────────
def fetch_orcid():
    """Every work on the record, newest first. Public API: no token needed."""
    raw = get("https://pub.orcid.org/v3.0/%s/works" % ORCID_ID,
              {"Accept": "application/json",
               "User-Agent": "dr-aks.github.io refresh (mailto:%s)" % CONTACT})
    rows = []
    for g in json.loads(raw).get("group", []):
        ss = g.get("work-summary") or []
        if not ss:
            continue
        s = ss[0]
        title = (((s.get("title") or {}).get("title") or {}).get("value") or "").strip()
        if not title:
            continue
        year = (((s.get("publication-date") or {}).get("year") or {}).get("value") or "")
        journal = ((s.get("journal-title") or {}) or {}).get("value") or ""
        doi = ""
        for e in ((s.get("external-ids") or {}).get("external-id") or []):
            if (e.get("external-id-type") or "").lower() == "doi":
                doi = (e.get("external-id-value") or "").strip()
                break
        rows.append({"t": title, "y": year, "j": journal, "doi": doi})
    rows.sort(key=lambda r: (-(int(r["y"]) if str(r["y"]).isdigit() else 0), r["t"]))
    return rows


def write_works(rows):
    with open(WORKS, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=1)


def write_fallback(rows):
    """Recompile the offline list inside pubs.js.

    publications.html loads live from ORCID on every visit; this array is only
    what a visitor sees when that request fails. It still has to be current,
    because 'the cached list' is what shows during an ORCID outage.
    """
    with open(PUBS_JS, encoding="utf-8") as f:
        js = f.read()
    start = js.index("  /* ---------- last-saved fallback list")
    end = js.index("\n  ];", start) + len("\n  ];")

    def esc(t):
        return t.replace("\\", "\\\\").replace('"', '\\"')

    stamp = datetime.date.today().strftime("%d %b %Y")
    body = ",\n".join(
        '    { title: "%s", year: "%s", journal: "%s", doi: "%s" }'
        % (esc(r["t"]), r["y"], esc(r["j"]), r["doi"]) for r in rows)
    block = ("  /* ---------- last-saved fallback list (refreshed from ORCID, %s) ---------- */\n"
             "  var FALLBACK_WORKS = [\n%s\n  ];" % (stamp, body))
    if js[start:end] == block:
        return False
    with open(PUBS_JS, "w", encoding="utf-8") as f:
        f.write(js[:start] + block + js[end:])
    return True


# ──────────────────────────── Scholar ─────────────────────────────────────
def fetch_scholar():
    """Item count and the three citation figures from the public profile."""
    hdr = {"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"}
    page = get("https://scholar.google.com/citations?user=%s&hl=en&cstart=0&pagesize=100"
               % SCHOLAR_ID, hdr)
    if "not a robot" in page or "unusual traffic" in page.lower():
        raise RuntimeError("Scholar served a bot challenge")

    cells = re.findall(r'<td class="gsc_rsb_std">(\d+)</td>', page)
    if len(cells) < 6:
        raise RuntimeError("Scholar metrics table not found (layout changed?)")

    items = len(re.findall(r'class="gsc_a_tr"', page))
    start = 100
    while items >= start:                      # the list is paginated at 100
        time.sleep(2)
        more = get("https://scholar.google.com/citations?user=%s&hl=en&cstart=%d&pagesize=100"
                   % (SCHOLAR_ID, start), hdr)
        n = len(re.findall(r'class="gsc_a_tr"', more))
        items += n
        if n < 100:
            break
        start += 100

    # column order is all-time then since-2021; the site quotes all-time
    return {"scholar_items": items, "citations": int(cells[0]),
            "h_index": int(cells[2]), "i10_index": int(cells[4])}


def group(n):
    """1859 -> '1,859'. Matches the formatter in shell.js exactly; if the two
    ever diverge the page flickers between two spellings of the same number."""
    return "{:,}".format(int(n))


def patch_pages(metrics):
    """Write the figures into the HTML as well as the JSON.

    shell.js fills these slots on load, but a visitor with JavaScript off -- or
    arriving before the fetch lands -- sees whatever the page shipped with. The
    weekly commit therefore updates the markup too, so the two never disagree
    by more than one week.
    """
    touched = []
    for name in PAGES:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        html = io.open(path, encoding="utf-8").read()
        before = html
        for key, value in metrics.items():
            if not isinstance(value, int):
                continue
            pat = re.compile(
                r'(<span[^>]*data-(?:metric|scholar)="%s"[^>]*>)([^<]*)(</span>)' % key)

            def one(m, v=value):
                open_tag = re.sub(r'data-target="\d+"', 'data-target="%d"' % v, m.group(1))
                pre = re.search(r'data-prefix="([^"]*)"', open_tag)
                suf = re.search(r'data-suffix="([^"]*)"', open_tag)
                text = (pre.group(1) if pre else "") + group(v) + (suf.group(1) if suf else "")
                return open_tag + text + m.group(3)

            html = pat.sub(one, html)
        if html != before:
            io.open(path, "w", encoding="utf-8").write(html)
            touched.append(name)
    return touched


# ───────────────────────────── main ───────────────────────────────────────
def main():
    try:
        with open(METRICS, encoding="utf-8") as f:
            m = json.load(f)
    except Exception:
        m = {}
    m.setdefault("sources", {})
    changed = []

    # -- ORCID ------------------------------------------------------------
    try:
        rows = fetch_orcid()
        if len(rows) < 10:
            raise RuntimeError("only %d works returned; refusing to overwrite" % len(rows))
        old = []
        if os.path.exists(WORKS):
            with open(WORKS, encoding="utf-8") as f:
                old = json.load(f)
        if old != rows:
            write_works(rows)
            changed.append("data/works.json (%d works)" % len(rows))
        if write_fallback(rows):
            changed.append("assets/js/pubs.js fallback (%d works)" % len(rows))
        m["orcid_works"] = len(rows)
        m["orcid_journal_articles"] = sum(1 for r in rows if (r["j"] or "").strip())
        m["sources"]["orcid"] = {"status": "ok", "fetched": TODAY}
        print("ORCID   : %d works" % len(rows))
    except Exception as e:
        prev = m.get("sources", {}).get("orcid", {})
        m["sources"]["orcid"] = {"status": "failed", "error": str(e)[:200],
                                 "last_ok": prev.get("fetched") or prev.get("last_ok")}
        print("ORCID   : FAILED (%s) -- keeping previous list" % e, file=sys.stderr)

    # -- Scholar ----------------------------------------------------------
    try:
        s = fetch_scholar()
        for k, v in s.items():
            if m.get(k) != v:
                changed.append("%s %s -> %s" % (k, m.get(k), v))
            m[k] = v
        m["sources"]["scholar"] = {"status": "ok", "fetched": TODAY}
        print("Scholar : %(scholar_items)d items, %(citations)d citations, "
              "h=%(h_index)d, i10=%(i10_index)d" % s)
    except Exception as e:
        prev = m.get("sources", {}).get("scholar", {})
        m["sources"]["scholar"] = {"status": "failed", "error": str(e)[:200],
                                   "last_ok": prev.get("fetched") or prev.get("last_ok")}
        print("Scholar : FAILED (%s) -- keeping previous figures" % e, file=sys.stderr)

    live = {k: m[k] for k in ("scholar_items", "citations", "h_index", "i10_index")
            if isinstance(m.get(k), int)}
    if live:
        touched = patch_pages(live)
        if touched:
            changed.append("figures in " + ", ".join(touched))

    m["last_updated"] = TODAY
    m["note"] = ("Headline figures follow Google Scholar; the publication list follows the "
                 "curated ORCID record. Scholar's item count runs ahead because it folds in "
                 "preprints, chapters and duplicate records.")
    ordered = {k: m[k] for k in ("scholar_items", "citations", "h_index", "i10_index",
                                 "orcid_works", "orcid_journal_articles") if k in m}
    ordered.update({k: v for k, v in m.items() if k not in ordered})
    with open(METRICS, "w", encoding="utf-8") as f:
        json.dump(ordered, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("\nchanged: " + ("; ".join(changed) if changed else "nothing"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
