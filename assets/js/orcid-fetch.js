/**
 * orcid-fetch.js
 * Automatically fetches publications from ORCID public API and renders them.
 * ──────────────────────────────────────────────────────────
 * HOW TO USE:
 *   1. Set YOUR_ORCID_ID below (format: 0000-0000-0000-0000)
 *   2. This script is included in publications.html
 *   3. It fetches live data from ORCID every time the page loads
 *   4. No server needed — works on GitHub Pages
 * ──────────────────────────────────────────────────────────
 */

// ════════════════════════════════════════
// ▶ SET YOUR ORCID ID HERE (only change needed)
const ORCID_ID = "0000-0002-5240-3472";
// ════════════════════════════════════════

const ORCID_API = `https://pub.orcid.org/v3.0/${ORCID_ID}/works`;

async function fetchORCIDPublications() {
  const container = document.getElementById('orcid-live-pubs');
  const statusEl  = document.getElementById('orcid-status');
  if (!container) return;

  // Don't fetch if ORCID ID not set
  if (ORCID_ID === "YOUR-ORCID-ID-HERE" || !ORCID_ID) {
    statusEl && (statusEl.innerHTML = `<span style="color:var(--amber);">⚠ Set your ORCID ID in <code>assets/js/orcid-fetch.js</code> to enable auto-fetch.</span>`);
    return;
  }

  statusEl && (statusEl.innerHTML = `<span style="color:var(--text3);"><i class="fas fa-spinner fa-spin"></i> Fetching live from ORCID…</span>`);

  try {
    const res = await fetch(ORCID_API, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`ORCID API error: ${res.status}`);
    const data = await res.json();

    const works = data.group || [];
    if (works.length === 0) {
      statusEl && (statusEl.innerHTML = `<span style="color:var(--text3);">No public works found on ORCID for ${ORCID_ID}.</span>`);
      return;
    }

    // Sort by publication year (descending)
    const parsed = works.map(g => {
      const summaryArr = g['work-summary'];
      const summary = (summaryArr && summaryArr[0]) || {};
      const pubDate = summary['publication-date'];
      const year    = (pubDate && pubDate.year && pubDate.year.value) || '0';
      const titleObj = summary.title;
      const title   = (titleObj && titleObj.title && titleObj.title.value) || 'Untitled';
      const journalObj = summary['journal-title'];
      const journal = (journalObj && journalObj.value) || '';
      const type    = summary.type || '';
      const urlObj  = summary.url;
      const url     = (urlObj && urlObj.value) || '';
      const extIdsObj = summary['external-ids'];
      const extIds  = (extIdsObj && extIdsObj['external-id']) || [];
      const doi     = extIds.find(function(e) { return e['external-id-type'] === 'doi'; });
      const doiUrl  = doi ? ('https://doi.org/' + doi['external-id-value']) : url;

      return { year: parseInt(year), title, journal, type, doiUrl };
    }).filter(p => p.year > 0)
      .sort((a, b) => b.year - a.year);

    // Group by year
    const byYear = {};
    parsed.forEach(p => {
      if (!byYear[p.year]) byYear[p.year] = [];
      byYear[p.year].push(p);
    });

    // Render
    let html = '';
    Object.keys(byYear).sort((a,b) => b-a).forEach(year => {
      html += `
        <div class="year-heading" style="margin-top:2rem;">
          <span>${year}</span>
          <span style="flex:1;height:1px;background:var(--border);"></span>
          <span style="font-size:0.75rem;color:var(--text3);">${byYear[year].length} paper${byYear[year].length>1?'s':''}</span>
        </div>`;
      byYear[year].forEach((p, i) => {
        const link = p.doiUrl ? `href="${p.doiUrl}" target="_blank" rel="noopener noreferrer"` : '';
        html += `
        <div class="pub-item" style="padding:0.9rem 0;border-bottom:1px solid var(--border);">
          <div style="font-family:var(--font-serif);font-size:0.95rem;color:#1c1917;line-height:1.5;margin-bottom:0.3rem;">
            ${link ? `<a ${link} class="orcid-pub-link" style="color:inherit;text-decoration:none;">` : ''}
            ${p.title}
            ${link ? '</a>' : ''}
          </div>
          ${p.journal ? `<div style="font-size:0.8rem;color:#0ea5e9;font-style:italic;">${p.journal}</div>` : ''}
          ${p.doiUrl ? `<div style="margin-top:0.3rem;"><a href="${p.doiUrl}" target="_blank" rel="noopener noreferrer" class="orcid-doi-link" style="font-size:0.75rem;color:#7c3aed;font-family:sans-serif;">DOI →</a></div>` : ''}
        </div>`;
      });
    });

    container.innerHTML = html;
    statusEl && (statusEl.innerHTML = `
      <span style="color:#22c55e;">
        <i class="fas fa-check-circle"></i> Live from ORCID · ${parsed.length} publications · Last updated: ${new Date().toLocaleDateString('en-IN')}
      </span>`);

    // Update metrics badge
    const countEl = document.getElementById('orcid-pub-count');
    if (countEl) countEl.textContent = parsed.length;

  } catch (err) {
    console.error('ORCID fetch error:', err);
    statusEl && (statusEl.innerHTML = `
      <span style="color:var(--amber);">
        <i class="fas fa-exclamation-triangle"></i> Could not fetch from ORCID. Showing curated list below.
        <a href="https://orcid.org/${ORCID_ID}" target="_blank" rel="noopener noreferrer" style="color:var(--violet);">View on ORCID ↗</a>
      </span>`);
    container.style.display = 'none';
  }
}

// Inject hover styles for ORCID-generated links (avoids inline onmouseover handlers)
(function() {
  var style = document.createElement('style');
  style.textContent = '.orcid-pub-link:hover { color: #7c3aed !important; }' +
                      '.orcid-doi-link:hover { opacity: 0.75; }';
  document.head.appendChild(style);
})();

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', fetchORCIDPublications);
