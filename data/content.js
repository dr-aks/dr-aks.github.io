/**
 * ══════════════════════════════════════════════════════════════
 *  WEBSITE CONTENT FILE — Dr. Ashish Kumar
 *  Edit this file to update your website content easily.
 * ══════════════════════════════════════════════════════════════
 *
 *  HOW TO EDIT:
 *  1. Open this file in GitHub (click pencil icon ✏️)
 *  2. Make your changes below
 *  3. Click "Commit changes" at the bottom
 *  4. Your website updates in ~60 seconds — no coding needed!
 *
 *  This file controls:
 *    ✦ Your citation metrics (h-index, citations, etc.)
 *    ✦ Invited talks list (auto-displayed on website)
 *    ✦ News & highlights timeline
 *    ✦ Gallery photo list (add photo filename + caption here)
 * ══════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────
// SECTION 1: YOUR ORCID ID
// Get it from https://orcid.org — looks like: 0000-0002-1825-0097
// ─────────────────────────────────────────────────────────────
const MY_ORCID_ID = "YOUR-ORCID-ID-HERE";


// ─────────────────────────────────────────────────────────────
// SECTION 2: CITATION METRICS
// Update these numbers whenever your metrics change.
// These appear on the Home page and Publications page.
// ─────────────────────────────────────────────────────────────
const METRICS = {
  publications: 78,      // Total publications
  hIndex: 26,            // h-index (Google Scholar)
  i10Index: 39,          // i10-index
  citations: 1680,       // Total citations
  fundingLakhs: 145,     // Total funding as PI (in Lakhs)
  invitedTalks: 30,      // Number of invited talks
  phdStudents: 7,        // Total PhD students (current + graduated)
  patents: 4             // Number of patents
};


// ─────────────────────────────────────────────────────────────
// SECTION 3: INVITED TALKS
// Add new talks at the TOP of this list (newest first).
// Fields: year, title, event, location, type ("invited"/"keynote"/"plenary")
// ─────────────────────────────────────────────────────────────
const INVITED_TALKS = [
  {
    year: 2026,
    title: "Deep Level Transient Spectroscopy — Fundamentals and Applications",
    event: "Refresher Course in Physics, Central University of Haryana (CUH)",
    location: "Mahendergarh, Haryana",
    type: "invited"
  },
  {
    year: 2024,
    title: "Thermoelectric Energy Harvesting: From Materials to Devices",
    event: "National Workshop on Advanced Energy Materials",
    location: "IIT Ropar, Punjab",
    type: "invited"
  },
  {
    year: 2023,
    title: "Defect Engineering in Wide-Bandgap Semiconductors via Ion Beams",
    event: "International Conference on Materials for Energy, MESD 2023",
    location: "JNU, New Delhi",
    type: "invited"
  },
  {
    year: 2023,
    title: "Ion-Matter Interactions and In-Situ Electrical Characterisation",
    event: "Winter School on Ion Beam Physics",
    location: "IUAC, New Delhi",
    type: "invited"
  },
  {
    year: 2022,
    title: "PEDOT:PSS Based Flexible Thermoelectric Devices",
    event: "International Symposium on Advanced Materials (ISAM)",
    location: "NIT Hamirpur",
    type: "invited"
  },
  {
    year: 2021,
    title: "Space Instrumentation: EUV/X-ray Multilayer Mirrors",
    event: "National Seminar on Space Science and Technology",
    location: "Aryabhatta Research Institute of Observational Sciences (ARIES)",
    type: "invited"
  },
  {
    year: 2019,
    title: "In-Situ DLTS of GaN Under Live Swift Heavy Ion Irradiation",
    event: "International Conference on Defects in Semiconductors (DRIP)",
    location: "Matsue, Japan",
    type: "invited"
  },
  {
    year: 2019,
    title: "Thermoelectric Materials: Challenges and Opportunities",
    event: "DST Workshop on Energy Harvesting Materials",
    location: "National Physical Laboratory, New Delhi",
    type: "invited"
  },
  {
    year: 2017,
    title: "Electrical Properties of SHI-Irradiated GaN/AlGaN Heterostructures",
    event: "DRIP XVII — Defects in Semiconductors",
    location: "Valladolid, Spain",
    type: "invited"
  }
  // ← ADD NEW TALKS ABOVE THIS LINE
  // Copy the block above, update fields, add comma at end
];


// ─────────────────────────────────────────────────────────────
// SECTION 4: NEWS & HIGHLIGHTS
// Add new items at the TOP (newest first).
// Categories: "award" | "publication" | "talk" | "student" | "project" | "conference"
// ─────────────────────────────────────────────────────────────
const NEWS_ITEMS = [
  {
    date: "March 2026",
    title: "Resource Person — Refresher Course in Physics",
    description: "Invited as resource person at Central University of Haryana (CUH), Mahendergarh. Lecture on Deep Level Transient Spectroscopy.",
    category: "talk"
  },
  {
    date: "December 2025",
    title: "Best Poster Award — Ms. Muskan",
    description: "Ms. Muskan (PhD scholar) awarded Best Poster at DAE Solid State Physics Symposium (DAE-SSPS 2025).",
    category: "student"
  },
  {
    date: "October 2025",
    title: "Best PhD Thesis Award — Dr. Vaishali Rathi",
    description: "Dr. Vaishali Rathi's thesis on Printable Flexible Thermoelectric Devices awarded Best PhD Thesis at UPES Dehradun Convocation.",
    category: "student"
  },
  {
    date: "September 2024",
    title: "RSC Advances Outstanding Paper Award",
    description: "Paper on PEDOT:PSS/Bi₂Te₃/rGO flexible thermoelectric composites selected for Outstanding Paper Award by Royal Society of Chemistry.",
    category: "award"
  },
  {
    date: "2024",
    title: "DRDO Research Project Sanctioned",
    description: "New project on GaN/AlGaN HEMT radiation hardness studies sanctioned under CARS programme (₹26.07 Lakh).",
    category: "project"
  },
  {
    date: "2023",
    title: "New Publication: High ZT in Bi₂Te₃ Composites",
    description: "Paper on enhanced thermoelectric performance of Sn/Zn co-doped Bi₂Te₃ published in Journal of Materials Science: Materials in Electronics.",
    category: "publication"
  },
  {
    date: "2022",
    title: "ISRO RESPOND Project Sanctioned",
    description: "Major research grant of ₹60 Lakh sanctioned under ISRO RESPOND programme for EUV/X-ray multilayer mirrors for space polarimetry.",
    category: "project"
  },
  {
    date: "July 2019",
    title: "Lindau Nobel Laureate Meeting",
    description: "Selected as one of ~600 outstanding young scientists globally for the 69th Lindau Nobel Laureate Meeting, Germany.",
    category: "award"
  }
  // ← ADD NEW NEWS ITEMS ABOVE THIS LINE
];


// ─────────────────────────────────────────────────────────────
// SECTION 5: GALLERY PHOTOS
// Add new photos here. Upload the image file to assets/images/
// then add an entry below. The website will show it automatically.
// ─────────────────────────────────────────────────────────────
const GALLERY_PHOTOS = [
  {
    file: "with-donna-strickland.jpg",
    caption: "With Prof. Donna Strickland (Nobel Prize in Physics 2018)",
    detail: "69th Lindau Nobel Laureate Meeting · July 2019 · Lindau, Germany",
    category: "award"
  },
  {
    file: "with-novoselov.jpg",
    caption: "With Sir Konstantin Novoselov (Nobel Prize in Physics 2010)",
    detail: "Discoverer of Graphene · Lindau Nobel Laureate Meeting 2019",
    category: "award"
  },
  {
    file: "ictp-thermoelectricity-2019.jpg",
    caption: "Conference on Modern Concepts & New Materials for Thermoelectricity",
    detail: "ICTP, Trieste, Italy · March 11–15, 2019",
    category: "conference"
  },
  {
    file: "helmholtz-mainz-2019.jpg",
    caption: "Group Photo at Helmholtz-Institut Mainz",
    detail: "Lindau Meeting Scientific Excursion · July 10, 2019",
    category: "conference"
  },
  {
    file: "lindau-india-group-2019.jpg",
    caption: "Indian Scientists at 69th Lindau Nobel Laureate Meeting",
    detail: "Lindau, Germany · July 9, 2019",
    category: "conference"
  },
  {
    file: "lindau-discussion.jpg",
    caption: "Scientific Discussion at Lindau Meeting",
    detail: '"Educate. Inspire. Connect." · Lindau 2019',
    category: "award"
  },
  {
    file: "seebeck-setup-diagram.jpg",
    caption: "Seebeck Coefficient & Resistivity Measurement Setup",
    detail: "System I · Published in Review of Scientific Instruments, 2019",
    category: "lab"
  },
  {
    file: "cryostat-schematic.jpg",
    caption: "Dipstick Optical Cryostat — Custom Design",
    detail: "System V · 80–500 K · Simultaneous optical + transport measurements",
    category: "lab"
  }
  // ← ADD NEW PHOTOS ABOVE THIS LINE
  // Copy a block above, change file/caption/detail/category, add comma
  // Categories: "award" | "conference" | "lab" | "group"
];


// ══════════════════════════════════════════════════════════════
//  DO NOT EDIT BELOW THIS LINE
//  (This code reads the data above and updates the website)
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

  // Update metric counters if present on this page
  document.querySelectorAll('[data-target]').forEach(el => {
    const key = el.dataset.metricKey;
    if (key && METRICS[key] !== undefined) {
      el.dataset.target = METRICS[key];
      el.textContent = METRICS[key];
    }
  });

  // Render invited talks list if container exists
  const talksContainer = document.getElementById('invited-talks-list');
  if (talksContainer) {
    let html = '';
    INVITED_TALKS.forEach(t => {
      const badge = t.type === 'keynote' ? 'Keynote' : t.type === 'plenary' ? 'Plenary' : 'Invited';
      const color = t.type === 'keynote' ? 'var(--amber)' : t.type === 'plenary' ? 'var(--sky)' : 'var(--violet)';
      html += `
        <div style="padding:1rem 0;border-bottom:1px solid var(--border);display:flex;gap:1.2rem;align-items:start;">
          <span style="font-family:var(--font-sans);font-size:0.75rem;font-weight:700;color:var(--text3);min-width:40px;">${t.year}</span>
          <div style="flex:1;">
            <div style="font-family:var(--font-serif);font-size:0.95rem;color:var(--text);margin-bottom:0.25rem;">${t.title}</div>
            <div style="font-size:0.8rem;color:var(--text2);">${t.event}</div>
            <div style="font-size:0.78rem;color:var(--text3);">${t.location}</div>
          </div>
          <span style="font-family:var(--font-sans);font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${color};background:rgba(124,58,237,0.08);border:1px solid var(--border);border-radius:4px;padding:0.2rem 0.5rem;white-space:nowrap;">${badge}</span>
        </div>`;
    });
    talksContainer.innerHTML = html;
  }

  // Render news if container exists
  const newsContainer = document.getElementById('dynamic-news-list');
  if (newsContainer) {
    const catColors = {
      award: 'var(--amber)', publication: 'var(--sky)', talk: 'var(--violet)',
      student: '#22c55e', project: '#d97706', conference: 'var(--sky)'
    };
    let html = '';
    NEWS_ITEMS.forEach(n => {
      const color = catColors[n.category] || 'var(--text3)';
      html += `
        <div class="timeline-item">
          <div class="timeline-dot" style="background:${color};box-shadow:0 0 6px ${color};"></div>
          <div class="timeline-date">${n.date}</div>
          <div class="timeline-title">${n.title}</div>
          <div class="timeline-desc">${n.description}</div>
        </div>`;
    });
    newsContainer.innerHTML = html;
  }

});
