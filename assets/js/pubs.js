/* Publication finder: search, year and topic filters, sort, BibTeX.
   Loads live from ORCID and falls back to a saved list if that fails. */
(function () {
  const ORCID_ID = "0000-0002-5240-3472";
  const API_URL  = "https://pub.orcid.org/v3.0/" + ORCID_ID + "/works";
  const container = document.getElementById("orcid-pubs-container");

  /* ---------- last-saved fallback list (refreshed from ORCID, 26 Sep 2026) ---------- */
  var FALLBACK_WORKS = [
    { title: "Deep-level transient spectroscopy in wide-bandgap semiconductors (GaN, 4H-SiC, and β-Ga2O3): Methods, defect fingerprints, and device-relevant insights", year: "2026", journal: "Materials Today Physics", doi: "10.1016/j.mtphys.2026.102204" },
    { title: "Effect of CuS on self-powered photodetective properties of flexible ZnO-P3HT heterojunction device", year: "2026", journal: "MATERIALS SCIENCE AND ENGINEERING B-ADVANCED FUNCTIONAL SOLID-STATE MATERIALS", doi: "10.1016/J.MSEB.2025.119146" },
    { title: "Flexible and printable thermoelectric films based on FeCl<sub>3</sub> doped P3HT", year: "2026", journal: "SCIENTIFIC REPORTS", doi: "10.1038/S41598-025-22821-6" },
    { title: "Investigation of swift heavy Ni and Au ion irradiation effects on the optical and structural evolution of GaN probed by synchrotron PL, XANES, and Raman spectroscopies", year: "2026", journal: "Journal of Alloys and Compounds", doi: "10.1016/j.jallcom.2026.187760" },
    { title: "PVDF/Ni NWs Composite Films: A High-Performance N-Type Thermoelectric Material for Flexible Energy Harvesting", year: "2026", journal: "POLYMER COMPOSITES", doi: "10.1002/PC.70640" },
    { title: "Self-rectifying dynamic memristor based on 2D-graphene/V-doped Ga2O3 for neuromorphic processing", year: "2026", journal: "MATERIALS TODAY PHYSICS", doi: "10.1016/J.MTPHYS.2026.102064" },
    { title: "Ag-Based Nanoparticle Synthesis and Its Applications", year: "2025", journal: "BIONANOSCIENCE", doi: "10.1007/S12668-025-01913-7" },
    { title: "Enhanced UV protection and photocatalytic activity in Samarium and Europium co-doped TiO2 thin films: A durable solution for protective coatings", year: "2025", journal: "Materials Science and Engineering B", doi: "10.1016/j.mseb.2025.118429" },
    { title: "Enhancement in power factor of Sn and Zn co-doped Bismuth Telluride for thermoelectric applications", year: "2025", journal: "JOURNAL OF MATERIALS SCIENCE-MATERIALS IN ELECTRONICS", doi: "10.1007/S10854-025-14383-0" },
    { title: "Evaluating energy efficiency in LIG buildings using louver shading systems (Retracted article. See vol. 78, 2026)", year: "2025", journal: "CASE STUDIES IN THERMAL ENGINEERING", doi: "10.1016/J.CSITE.2025.106272" },
    { title: "Recent advancement in surface modification techniques for bio-implants", year: "2025", journal: "RESULTS IN ENGINEERING", doi: "10.1016/J.RINENG.2025.105192" },
    { title: "Structural and electrical changes in multilayer graphene induced by negative oxygen ion bombardment", year: "2025", journal: "Results in Surfaces and Interfaces", doi: "10.1016/j.rsurfi.2025.100490" },
    { title: "Swift heavy ion irradiation of gallium nitride: a review of defect dynamics, ion–matter interactions, and property modifications", year: "2025", journal: "Journal of Materials Science: Materials in Electronics", doi: "10.1007/s10854-025-15836-2" },
    { title: "Ab-Initio stability of Iridium based newly proposed full and quaternary heusler alloys", year: "2024", journal: "Physica B: Condensed Matter", doi: "10.1016/j.physb.2023.415539" },
    { title: "Boosting thermoelectric performance of PEDOT: PSS/Bi<sub>2</sub>Te<sub>3</sub> hybrid films via structural and interfacial engineering", year: "2024", journal: "ORGANIC ELECTRONICS", doi: "10.1016/J.ORGEL.2024.107103" },
    { title: "Disorder induced in GaN thin films by 200 MeV silver ions", year: "2024", journal: "NUCLEAR INSTRUMENTS & METHODS IN PHYSICS RESEARCH SECTION B-BEAM INTERACTIONS WITH MATERIALS AND ATOMS", doi: "10.1016/J.NIMB.2024.165346" },
    { title: "Electronic structure and luminescence studies of Bi doped MgO nanophosphors", year: "2024", journal: "Ceramics International", doi: "10.1016/j.ceramint.2024.02.046" },
    { title: "Graphene-derived composites: a new Frontier in thermoelectric energy conversion", year: "2024", journal: "Energy Advances", doi: "10.1039/d3ya00526g" },
    { title: "Improved thermoelectric performance of PEDOT:PSS/Bi2Te3/reduced graphene oxide ternary composite films for energy harvesting applications", year: "2024", journal: "RSC Advances", doi: "10.1039/D4RA06184E" },
    { title: "Influence of Gd and Ni doping on the structural, morphological, and magnetic properties of M-type calcium hexaferrite", year: "2024", journal: "NEW JOURNAL OF CHEMISTRY", doi: "10.1039/D3NJ05725A" },
    { title: "Ion-induced transformation of shallow defects into deep-level defects in GaN epilayers", year: "2024", journal: "NUCLEAR INSTRUMENTS & METHODS IN PHYSICS RESEARCH SECTION B-BEAM INTERACTIONS WITH MATERIALS AND ATOMS", doi: "10.1016/J.NIMB.2024.165362" },
    { title: "Oxygen ion irradiation: Insights into the structural modifications of CVD-grown graphene", year: "2024", journal: "Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms", doi: "10.1016/j.nimb.2024.165359" },
    { title: "Revolutionizing gas sensors: The role of composite materials with conducting polymers and transition metal oxides", year: "2024", journal: "Results in Chemistry", doi: "10.1016/j.rechem.2023.101255" },
    { title: "SERS detection of Rhodamine-6G on Au/V2O5/Au under ion irradiation", year: "2024", journal: "Nuclear Instruments and Methods in Physics Research Section B: Beam Interactions with Materials and Atoms", doi: "10.1016/j.nimb.2024.165351" },
    { title: "First‐Principles Study on Electronic and Thermal Transport Properties of FeRuTiX Quaternary Heusler Compounds (X=Si, Ge, Sn)", year: "2023", journal: "Zeitschrift für anorganische und allgemeine Chemie", doi: "10.1002/zaac.202300080" },
    { title: "Fractal characterizations of MeV ion treated CaF<sub>2</sub> thin films", year: "2023", journal: "Chaos", doi: "10.1063/5.0135127" },
    { title: "Impact of swift heavy oxygen ion irradiation on the performance of Pt/GaN Schottky diodes and epitaxial layers: A comparative study", year: "2023", journal: "JOURNAL OF APPLIED PHYSICS", doi: "10.1063/5.0171363" },
    { title: "In situ IV and CV characterization of Pt/n-GaN Schottky barrier diodes irradiated by 100 MeV oxygen ions", year: "2023", journal: "JOURNAL OF MATERIALS SCIENCE-MATERIALS IN ELECTRONICS", doi: "10.1007/S10854-023-11227-7" },
    { title: "Surface functionalization of gallium nitride for biomedical implant applications", year: "2023", journal: "APPLIED SURFACE SCIENCE", doi: "10.1016/J.APSUSC.2022.155858" },
    { title: "Surface states passivation in GaN single crystal by ruthenium solution", year: "2023", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/5.0134242" },
    { title: "Trap analysis on Pt-AlGaN/GaN Schottky barrier diode through deep level transient spectroscopy", year: "2023", journal: "Journal of Semiconductors", doi: "10.1088/1674-4926/44/4/042802" },
    { title: "Assessment of Lead-Free Tin Halide Perovskite Solar Cells Using <i>J-V</i> Hysteresis", year: "2022", journal: "Physica Status Solidi (a)", doi: "10.1002/PSSA.202100823" },
    { title: "Disorder Induced in Gan Thin Films by 200 Mev Silver Ions", year: "2022", journal: "", doi: "10.2139/ssrn.4185788" },
    { title: "Enhancement in thermoelectric properties of <i>n</i>-type (La<sub>0.7</sub>Sr<sub>0.3</sub>MnO<sub>3</sub>)<sub>0.5</sub>.(NiO)<sub>0.5</sub>: composite and nano-structure effect", year: "2022", journal: "JOURNAL OF PHYSICS D-APPLIED PHYSICS", doi: "10.1088/1361-6463/AC3171" },
    { title: "Defects assisted structural and electrical properties of Ar ion irradiated TiO<sub>2</sub>/SrTiO<sub>3</sub> bilayer", year: "2021", journal: "MATERIALS LETTERS", doi: "10.1016/J.MATLET.2020.128880" },
    { title: "Significant role of substrate temperature on the morphology, electronic structure and thermoelectric properties of SrTiO<sub>3</sub> films deposited by pulsed laser deposition", year: "2021", journal: "Surface and Coatings Technology", doi: "10.1016/J.SURFCOAT.2020.126740" },
    { title: "Thermoelectric properties of GaN with carrier concentration modulation: an experimental and theoretical investigation", year: "2021", journal: "PHYSICAL CHEMISTRY CHEMICAL PHYSICS", doi: "10.1039/D0CP03950K" },
    { title: "Understanding the role of structural distortions on the transport properties of Ar ion irradiated SrTiO<sub>3</sub> thin films: X-ray absorption investigation", year: "2021", journal: "JOURNAL OF APPLIED PHYSICS", doi: "10.1063/5.0067510" },
    { title: "Effect of γ-ray irradiation on Schottky and ohmic contacts on AlGaN/GaN hetero-structures", year: "2020", journal: "MICROELECTRONICS RELIABILITY", doi: "10.1016/J.MICROREL.2019.113565" },
    { title: "Investiga ion of Thermoelectric properties of Magnetic Insulator FeRuTiSi Using First Principle Calculation", year: "2020", journal: "DAE SOLID STATE PHYSICS SYMPOSIUM 2019", doi: "10.1063/5.0016596" },
    { title: "Radiation stability and reliability of Cu-ZnO/P3OT hybrid heterostructures under swift heavy ion irradiations", year: "2020", journal: "MATERIALS SCIENCE IN SEMICONDUCTOR PROCESSING", doi: "10.1016/J.MSSP.2019.104885" },
    { title: "Thermoelectric Properties of GaN with Carrier Concentration Modulation: An Experimental and Theoretical Investigation", year: "2020", journal: "ArXiv", doi: "" },
    { title: "Thermoelectric properties of Half-Metallic FeMnScGa Using First Principle Calculation", year: "2020", journal: "DAE SOLID STATE PHYSICS SYMPOSIUM 2019", doi: "10.1063/5.0016607" },
    { title: "Wide range temperature-dependent (80-630 K) study of Hall effect and the Seebeck coefficient of \\b{eta}-Ga2O3 single crystals", year: "2020", journal: "ArXiv", doi: "10.1063/5.0043903" },
    { title: "Apparatus for Seebeck coefficient measurement of wire, thin film, and bulk materials in the wide temperature range (80-650 K)", year: "2019", journal: "REVIEW OF SCIENTIFIC INSTRUMENTS", doi: "10.1063/1.5116186" },
    { title: "Defect engineering in wide bandgap materials for thermoelectric applications", year: "2019", journal: "SSI Newsletter", doi: "" },
    { title: "Effect of Fe ion implantation on the thermoelectric properties and electronic structures of CoSb<sub>3</sub> thin films", year: "2019", journal: "RSC ADVANCES", doi: "10.1039/C9RA06873B" },
    { title: "Effect of γ-ray irradiation on Schottky and ohmic contacts on AlGaN/GaN hetero-structures", year: "2019", journal: "Microelectronics Reliability", doi: "" },
    { title: "Electronic Structure and Thermoelectric Properties of Co<sub>2</sub>CrGa Using First Principles Calculations", year: "2019", journal: "DAE SOLID STATE PHYSICS SYMPOSIUM 2018", doi: "10.1063/1.5113207" },
    { title: "Gamma Irradiation Effect on Performance of β-Ga2O3 Metal-Semiconductor-Metal Solar-Blind Photodetectors for Space Applications", year: "2019", journal: "ECS Journal of Solid State Science and Technology", doi: "" },
    { title: "Gamma Irradiation Effect on Performance of β-Ga<sub>2</sub>O<sub>3</sub> Metal-Semiconductor-Metal Solar-Blind Photodetectors for Space Applications", year: "2019", journal: "ECS JOURNAL OF SOLID STATE SCIENCE AND TECHNOLOGY", doi: "10.1149/2.0291907JSS" },
    { title: "Influence of barrier inhomogeneities on transport properties of Pt/MoS<sub>2</sub> Schottky barrier junction", year: "2019", journal: "JOURNAL OF ALLOYS AND COMPOUNDS", doi: "10.1016/J.JALLCOM.2019.05.028" },
    { title: "Investigation of Thermoelectric properties of Magnetic Insulator FeRuTiSi Using First Principle Calculation", year: "2019", journal: "arXiv preprint arXiv:1912.03708", doi: "" },
    { title: "Investigations on magnetic and electrical properties of Zn doped Fe<sub>2</sub>O<sub>3</sub> nanoparticles and their correlation with local electronic structures", year: "2019", journal: "JOURNAL OF MAGNETISM AND MAGNETIC MATERIALS", doi: "10.1016/J.JMMM.2019.165398" },
    { title: "Thermoelectric properties of Half-Metallic FeMnScGa Using First Principle Calculation", year: "2019", journal: "arXiv preprint arXiv:1912.03709", doi: "" },
    { title: "Tuning the Electrical and Thermoelectric Properties of N Ion Implanted SrTiO 3 Thin Films and Their Conduction Mechanisms", year: "2019", journal: "Scientific reports", doi: "" },
    { title: "Tuning the Electrical and Thermoelectric Properties of N Ion Implanted SrTiO<sub>3</sub> Thin Films and Their Conduction Mechanisms", year: "2019", journal: "Scientific Reports", doi: "10.1038/S41598-019-51079-Y" },
    { title: "<i>In</i>-<i>situ</i> transport and microstructural evolution in GaN Schottky diodes and epilayers exposed to swift heavy ion irradiation", year: "2018", journal: "JOURNAL OF APPLIED PHYSICS", doi: "10.1063/1.4995491" },
    { title: "Engineering of electronic properties of single layer graphene by swift heavy ion irradiation", year: "2018", journal: "JOURNAL OF APPLIED PHYSICS", doi: "10.1063/1.4991990" },
    { title: "Identification of swift heavy ion induced defects in Pt/n-GaN Schottky diodes by in-situ deep level transient spectroscopy", year: "2018", journal: "Semiconductor Science and Technology", doi: "10.1088/1361-6641/aacd54" },
    { title: "Enhancement of thermopower in GaN by ion irradiation and possible mechanisms", year: "2017", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/1.4996410" },
    { title: "High-performance radiation stable ZnO/Ag/ZnO multilayer transparent conductive electrode", year: "2017", journal: "SOLAR ENERGY MATERIALS AND SOLAR CELLS", doi: "10.1016/J.SOLMAT.2017.05.009" },
    { title: "Influence of High Dose Gamma Irradiation on Electrical Characteristics of Si Photo Detectors", year: "2017", journal: "ECS Journal of Solid State Science and Technology", doi: "" },
    { title: "Influence of High Dose Gamma Irradiation on Electrical Characteristics of Si Photo Detectors", year: "2017", journal: "ECS JOURNAL OF SOLID STATE SCIENCE AND TECHNOLOGY", doi: "10.1149/2.0111710JSS" },
    { title: "Investigations on structural and magnetic properties of Mn doped Er<sub>2</sub>O<sub>3</sub>", year: "2017", journal: "SOLID STATE SCIENCES", doi: "10.1016/J.SOLIDSTATESCIENCES.2017.03.003" },
    { title: "Structural, optical and magnetic properties of N ion implanted CeO<sub>2</sub> thin films", year: "2017", journal: "RSC ADVANCES", doi: "10.1039/C6RA17069B" },
    { title: "Nano-pits on GaAs (100) surface: Preferential sputtering and diffusion", year: "2016", journal: "NUCLEAR INSTRUMENTS & METHODS IN PHYSICS RESEARCH SECTION B-BEAM INTERACTIONS WITH MATERIALS AND ATOMS", doi: "10.1016/J.NIMB.2016.03.053" },
    { title: "Structural and Dielectric Properties of Cu doped CeO<sub>2</sub>", year: "2016", journal: "INTERNATIONAL CONFERENCE ON CONDENSED MATTER AND APPLIED PHYSICS (ICC 2015)", doi: "10.1063/1.4946350" },
    { title: "Structural, electrical and magnetic properties of dilutely Y doped NiFe<sub>2</sub>O<sub>4</sub> nanoparticles", year: "2016", journal: "JOURNAL OF ALLOYS AND COMPOUNDS", doi: "10.1016/J.JALLCOM.2016.05.248" },
    { title: "Structural, morphological and vibrational properties of Fe2O3 nanoparticles", year: "2016", journal: "Proceedings of the International Conference on Nanotechnology for Better Living", doi: "" },
    { title: "Structural, morphological, electrical and dielectric properties of Mn doped CeO<sub>2</sub>", year: "2016", journal: "JOURNAL OF ALLOYS AND COMPOUNDS", doi: "10.1016/J.JALLCOM.2016.02.153" },
    { title: "Studies on the Thermal Stability of Ni/<i>n</i>-GaN and Pt/<i>n</i>-GaN Schottky Barrier Diodes", year: "2016", journal: "MATERIALS RESEARCH EXPRESS", doi: "10.1088/2053-1591/3/8/085901" },
    { title: "Understanding the origin of ferromagnetism in Er-doped ZnO system", year: "2016", journal: "RSC ADVANCES", doi: "10.1039/C6RA17761A" },
    { title: "A system for providing nest ID based identification of a geographical location and method thereof", year: "2015", journal: "", doi: "" },
    { title: "Role of growth temperature on the structural, optical and electrical properties of ZnO thin films", year: "2015", journal: "JOURNAL OF ALLOYS AND COMPOUNDS", doi: "10.1016/J.JALLCOM.2015.06.218" },
    { title: "Barrier height enhancement of Ni/GaN Schottky diode using Ru based passivation scheme", year: "2014", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/1.4870624" },
    { title: "Dynamics of modification of Ni/n-GaN Schottky barrier diodes irradiated at low temperature by 200 MeV Ag<SUP>14+</SUP> ions", year: "2014", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/1.4862471" },
    { title: "Sulphide passivation of GaN based Schottky diodes", year: "2014", journal: "CURRENT APPLIED PHYSICS", doi: "10.1016/J.CAP.2013.12.021" },
    { title: "XPS study of triangular GaN nano/micro-needles grown by MOCVD technique", year: "2014", journal: "MATERIALS SCIENCE AND ENGINEERING B-ADVANCED FUNCTIONAL SOLID-STATE MATERIALS", doi: "10.1016/J.MSEB.2014.03.010" },
    { title: "An approach to tune the amplitude of surface ripple patterns", year: "2013", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/1.4822302" },
    { title: "Ion beam-generated surface ripples: new insight in the underlying mechanism", year: "2013", journal: "NANOSCALE RESEARCH LETTERS", doi: "10.1186/1556-276X-8-336" },
    { title: "Micro-structural and temperature dependent electrical characterization of Ni/GaN Schottky barrier diodes", year: "2013", journal: "CURRENT APPLIED PHYSICS", doi: "10.1016/J.CAP.2013.03.009" },
    { title: "Role of ion beam induced solid flow in surface patterning of Si (100) using Ar ion beam irradiation", year: "2013", journal: "APPLIED SURFACE SCIENCE", doi: "10.1016/J.APSUSC.2013.06.124" },
    { title: "Temperature dependence of electrical characteristics of Pt/GaN Schottky diode fabricated by UHV e-beam evaporation", year: "2013", journal: "NANOSCALE RESEARCH LETTERS", doi: "10.1186/1556-276X-8-481" },
    { title: "Electrical and microstructural analyses of 200 MeV Ag<SUP>14+</SUP> ion irradiated Ni/GaN Schottky barrier diode", year: "2012", journal: "APPLIED PHYSICS LETTERS", doi: "10.1063/1.4758929" },
    { title: "Blistering study of H-implanted InGaAs for potential heterointegration applications", year: "2011", journal: "SEMICONDUCTOR SCIENCE AND TECHNOLOGY", doi: "10.1088/0268-1242/26/8/085032" },
    { title: "Defect Formation in GaN Epitaxial Layers due to SHI Irradiation", year: "2011", journal: "SOLID STATE PHYSICS: PROCEEDINGS OF THE 55TH DAE SOLID STATE PHYSICS SYMPOSIUM 2010, PTS A AND B", doi: "10.1063/1.3606246" },
    { title: "Defect formation in GaN epitaxial layers due to swift heavy ion irradiation", year: "2011", journal: "RADIATION EFFECTS AND DEFECTS IN SOLIDS", doi: "10.1080/10420150.2011.569716" },
    { title: "INVESTIGATION OF CURRENT-VOLTAGE CHARACTERISTICS OF Ni/GaN SCHOTTKY BARRIER DIODES FOR POTENTIAL HEMT APPLICATIONS", year: "2011", journal: "JOURNAL OF NANO- AND ELECTRONIC PHYSICS", doi: "" },
    { title: "TEMPERATURE DEPENDENCE OF 1/<i>f</i> NOISE IN GALLIUM NITRIDE EPITAXIAL LAYER", year: "2011", journal: "JOURNAL OF NANO- AND ELECTRONIC PHYSICS", doi: "" }
  ];

  /* ---------- topic inference ---------- */
  var TOPICS = [
    ["Thermoelectrics", /thermoelectric|seebeck|figure of merit|\bzT\b|power factor|PEDOT|Bi.?Te|telluride|heusler|thermal conductivity/i],
    ["GaN & wide-bandgap", /\bGaN\b|gallium nitride|AlGaN|\bSiC\b|Ga.?O.?|silicon carbide|schottky|wide.?bandgap/i],
    ["Defects & DLTS", /\bDLTS\b|deep.?level|trap|defect|vacancy|transient spectroscopy/i],
    ["Ion irradiation", /irradiat|ion beam|swift heavy|MeV|bombard|fluence|\bSHI\b/i],
    ["2D materials", /graphene|\bMoS|2D material|nanotube|carbon nano/i],
    ["Thin films & coatings", /thin film|coating|multilayer|sputter|\bCVD\b|deposition/i],
    ["Optics & photonics", /optical|photolum|luminesc|phosphor|Raman|XANES|photodetector|\bUV\b|\bEUV\b|SERS|mirror/i],
    ["Devices & sensors", /diode|transistor|sensor|device|detector|photovolt|solar/i],
    ["Theory & DFT", /first.?principles|ab.?initio|density functional|\bDFT\b|simulation|computational/i]
  ];
  function topicsOf(w) {
    var hay = (w.title || "") + " " + (w.journal || "");
    var out = [];
    TOPICS.forEach(function (t) { if (t[1].test(hay)) out.push(t[0]); });
    return out.length ? out : ["Other"];
  }

  /* ---------- state ---------- */
  var ALL = [], LIVE = false;
  var $q, $year, $topic, $sort, $count;

  function esc(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;")
                      .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function mark(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0,i)) + '<span class="pf-hit">' +
           esc(text.slice(i, i+q.length)) + '</span>' + esc(text.slice(i+q.length));
  }
  function getDOI(externalIds) {
    if (!externalIds) return "";
    var list = externalIds["external-id"] || [];
    var m = list.find(function (e) { return e["external-id-type"] === "doi"; });
    return m ? (m["external-id-value"] || "") : "";
  }

  /* ---------- current selection ---------- */
  function selected() {
    var q = ($q.value || "").trim().toLowerCase();
    var y = $year.value, t = $topic.value, so = $sort.value;
    var out = ALL.filter(function (w) {
      if (y && String(w.year) !== y) return false;
      if (t && w.topics.indexOf(t) < 0) return false;
      if (q) {
        var hay = (w.title + " " + w.journal + " " + w.year + " " + w.topics.join(" ")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    out.sort(function (a, b) {
      if (so === "az") return a.title.localeCompare(b.title);
      if (so === "jr") return (a.journal||"").localeCompare(b.journal||"") ||
                              (parseInt(b.year,10)||0) - (parseInt(a.year,10)||0);
      var d = (parseInt(a.year,10)||0) - (parseInt(b.year,10)||0);
      return so === "old" ? d : -d;
    });
    return out;
  }

  /* ---------- render ---------- */
  function paint() {
    var works = selected();
    var q = ($q.value || "").trim();

    $count.innerHTML = works.length === ALL.length
      ? "Showing all <strong>" + ALL.length + "</strong> publications"
      : "Showing <strong>" + works.length + "</strong> of " + ALL.length + " publications";

    if (!works.length) {
      container.innerHTML = '<p class="pf-none">Nothing matches that. Try a broader term, or clear the filters.</p>';
      return;
    }

    var html = "";
    if (!LIVE) {
      html += '<p style="font-size:0.75rem;color:var(--text3);text-align:right;margin-bottom:0.5rem;font-style:italic;">Showing last saved list &mdash; live ORCID sync unavailable</p>';
    }

    var grouped = ($sort.value === "new" || $sort.value === "old");
    if (grouped) {
      var byYear = {}, order = [];
      works.forEach(function (w) {
        var y = w.year || "Undated";
        if (!byYear[y]) { byYear[y] = []; order.push(y); }
        byYear[y].push(w);
      });
      order.forEach(function (year) {
        html += '<div class="year-group"><div class="year-heading">' + esc(year) + "</div>";
        byYear[year].forEach(function (w) { html += item(w, q); });
        html += "</div>";
      });
    } else {
      html += '<div class="year-group">';
      works.forEach(function (w) { html += item(w, q); });
      html += "</div>";
    }
    container.innerHTML = html;
  }

  function item(w, q) {
    var doiURL = w.doi ? "https://doi.org/" + w.doi : "";
    var h = '<div class="pub-item">';
    h += doiURL
      ? '<a class="pub-title-link" href="' + esc(doiURL) + '" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;">' + mark(w.title, q) + "</a>"
      : '<div class="pub-title-link">' + mark(w.title, q) + "</div>";
    h += '<div class="pub-meta">';
    if (w.journal) {
      h += '<span class="journal-name">' + mark(w.journal, q) + "</span>";
      if (w.year) h += " (" + esc(w.year) + ")";
    }
    if (w.doi) {
      h += ' &nbsp;&middot;&nbsp; <a href="' + esc(doiURL) + '" target="_blank" rel="noopener noreferrer" style="color:var(--sky-ink);font-size:0.8rem;">' + esc(w.doi) + "</a>";
    }
    h += "</div></div>";
    return h;
  }

  /* ---------- BibTeX for whatever is on screen ---------- */
  function bibtex() {
    return selected().map(function (w, i) {
      var first = (w.title.split(/\s+/)[0] || "ref").replace(/[^A-Za-z]/g, "").toLowerCase();
      var key = "sharma" + (w.year || "") + first + (i ? String(i) : "");
      return "@article{" + key + ",\n" +
             "  author  = {Kumar, Ashish},\n" +
             "  title   = {" + w.title.replace(/[{}]/g, "") + "},\n" +
             (w.journal ? "  journal = {" + w.journal + "},\n" : "") +
             (w.year ? "  year    = {" + w.year + "},\n" : "") +
             (w.doi ? "  doi     = {" + w.doi + "},\n" : "") +
             "}";
    }).join("\n\n");
  }

  /* ---------- wire up ---------- */
  function ready(works, isLive) {
    LIVE = isLive;
    ALL = works.map(function (w) { w.topics = topicsOf(w); return w; });

    $q = document.getElementById("pf-q");
    $year = document.getElementById("pf-year");
    $topic = document.getElementById("pf-topic");
    $sort = document.getElementById("pf-sort");
    $count = document.getElementById("pf-count");
    if (!$q) { container.innerHTML = ""; return; }

    var years = {}, tops = {};
    ALL.forEach(function (w) {
      if (w.year) years[w.year] = (years[w.year] || 0) + 1;
      w.topics.forEach(function (t) { tops[t] = (tops[t] || 0) + 1; });
    });
    Object.keys(years).sort(function (a, b) { return b - a; }).forEach(function (y) {
      var o = document.createElement("option");
      o.value = y; o.textContent = y + "  (" + years[y] + ")";
      $year.appendChild(o);
    });
    Object.keys(tops).sort(function (a, b) { return tops[b] - tops[a]; }).forEach(function (t) {
      var o = document.createElement("option");
      o.value = t; o.textContent = t + "  (" + tops[t] + ")";
      $topic.appendChild(o);
    });

    var timer;
    $q.addEventListener("input", function () {
      clearTimeout(timer); timer = setTimeout(paint, 90);
    });
    [$year, $topic, $sort].forEach(function (el) { el.addEventListener("change", paint); });

    document.getElementById("pf-clear").addEventListener("click", function () {
      $q.value = ""; $year.value = ""; $topic.value = ""; $sort.value = "new"; paint();
    });
    document.getElementById("pf-bib").addEventListener("click", function (e) {
      var btn = e.currentTarget, txt = bibtex();
      function done(ok) {
        btn.textContent = ok ? "Copied" : "Press ⌘C";
        setTimeout(function () { btn.textContent = "Copy BibTeX"; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = txt; ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px";
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
        document.body.removeChild(ta); done(ok);
      }
    });

    paint();
  }

  /* ---------- fetch ---------- */
  fetch(API_URL, { headers: { "Accept": "application/json" } })
    .then(function (resp) {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.json();
    })
    .then(function (data) {
      var groups = (data && data.group) ? data.group : [];
      if (!groups.length) throw new Error("Empty ORCID response");

      var works = [];
      groups.forEach(function (grp) {
        var summaries = grp["work-summary"] || [];
        if (!summaries.length) return;
        var s = summaries[0];
        var title   = (s.title && s.title.title && s.title.title.value) ? s.title.title.value : "";
        var year    = (s["publication-date"] && s["publication-date"].year) ? s["publication-date"].year.value : "";
        var journal = (s["journal-title"] && s["journal-title"].value) ? s["journal-title"].value : "";
        var doi     = getDOI(s["external-ids"]);
        if (title) works.push({ title: title, year: year, journal: journal, doi: doi });
      });

      if (!works.length) throw new Error("No works in ORCID response");
      ready(works, true);
    })
    .catch(function (err) {
      console.warn("ORCID fetch failed, showing cached list:", err.message || err);
      ready(FALLBACK_WORKS, false);
    });
})();
