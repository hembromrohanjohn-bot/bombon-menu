/* ============================================================
   Bombon menu — renders MENU (menu-data.js) one tab at a time, with
   Drinks / Food / Sweets tabs, ★ Signatures, a Veg | Non-veg switch
   (egg counts as non-veg), search, and section links that follow the scroll.
   ============================================================ */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = n => Number(n).toLocaleString("en-IN");
const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const TABS = { drinks: "Drinks", food: "Food", sweets: "Sweets" };
const TAB_COLOURS = { drinks: "#1F4B99", food: "#8E2B1F", sweets: "#9A5A12" };
const DIETS = ["all", "veg", "nonveg"];
const isNonVeg = it => it.diet === "nonveg" || it.diet === "egg";      // egg dishes sit with non-veg
const dietOk = it => state.diet === "all" || (state.diet === "veg" ? !isNonVeg(it) : isNonVeg(it));
const SIG = new Set(Object.values(SIGNATURES).flat());
const state = { tab: "drinks", diet: "all", q: "", picks: false };

/* Every dish gets a stable id, e.g. "food/de-la-casa/turkish-eggs" (used by the order basket). */
const ITEM_BY_ID = {};
for (const [tab, secs] of Object.entries(MENU))
  for (const sec of secs) for (const it of sec.items) {
    it.id = `${tab}/${sec.id}/${slug(it.name)}`;
    ITEM_BY_ID[it.id] = { item: it, sec, tab };
  }
const findItem = (tab, name) => { for (const sec of MENU[tab]) { const it = sec.items.find(i => i.name === name); if (it) return [sec, it]; } return []; };

/* ---------- marks ---------- */
const markHTML = it => isNonVeg(it)
  ? `<span class="mark nonveg" role="img" aria-label="Non-vegetarian" title="Non-vegetarian"></span>`
  : `<span class="mark veg" role="img" aria-label="Vegetarian" title="Vegetarian"></span>`;
const tagsHTML = it => (it.diet === "egg" ? '<span class="tag egg" title="Contains egg">EGG</span>' : "") + (SIG.has(it.name) ? '<span class="sig">signature</span>' : "");
const ctlHTML = it => (window.ORDER && it.price != null) ? `<div class="ctl" data-id="${esc(it.id)}">${ORDER.ctl(it.id)}</div>` : "";

function itemHTML(it) {
  const price = it.price == null ? '<div class="price ask">ask us</div>' : `<div class="price">${fmt(it.price)}</div>`;
  return `<div class="item" data-id="${esc(it.id)}"><h3>${markHTML(it)}<span class="nm">${esc(it.name)}</span>${it.option ? `<span class="opt">${esc(it.option)}</span>` : ""}${tagsHTML(it)}</h3>${price}${it.desc ? `<p>${esc(it.desc)}</p>` : ""}${ctlHTML(it)}</div>`;
}
const legendHTML = () => '<div class="legend"><span><span class="mark veg"></span>Vegetarian</span><span><span class="mark nonveg"></span>Non-vegetarian</span><span><span class="tag egg">EGG</span>Contains egg</span><span class="sig">signature</span></div>';

/* ---------- empty states ---------- */
function emptyHTML(q) {
  if (q) return `<div class="empty">Nothing matches “${esc(state.q)}”. Try another word.</div>`;
  const other = Object.keys(MENU).find(t => t !== state.tab && MENU[t].some(s => s.items.some(dietOk)));
  const what = state.diet === "veg" ? "vegetarian" : "non-veg";
  return `<div class="empty">No ${what} dishes in ${TABS[state.tab]}.${other ? `<button type="button" data-go="${other}">See ${TABS[other]}</button>` : ""}</div>`;
}

/* ---------- ★ Signatures ---------- */
function renderPicks() {
  const tab = state.tab, q = state.q.trim().toLowerCase();
  const rows = SIGNATURES[tab].map((name, i) => {
    const [sec, it] = findItem(tab, name);
    if (!it || !dietOk(it) || (q && ![name, it.desc, sec.es, sec.en].join(" ").toLowerCase().includes(q))) return "";
    return `<div class="item pick" data-id="${esc(it.id)}"><span class="rank">${i + 1}</span><h3>${markHTML(it)}<span class="nm">${esc(name)}</span>${it.diet === "egg" ? '<span class="tag egg">EGG</span>' : ""}</h3><div class="price">${fmt(it.price)}</div>`
      + `<div class="from">${esc(sec.es)}${sec.en ? ` · ${esc(sec.en)}` : ""}</div>${it.desc ? `<p>${esc(it.desc)}</p>` : ""}`
      + `<button class="jump" data-sec="${sec.id}" data-name="${esc(name)}">See it on the menu</button>${ctlHTML(it)}</div>`;
  }).join("");
  $("#pages").innerHTML = rows
    ? `<section class="sec" id="signatures"><div class="sec-head"><h2>Signatures</h2><span class="en">(${TABS[tab]})</span></div><p class="picks-intro">The house signatures, the ${tab === "drinks" ? "drinks" : "plates"} Bombon is built around.</p>${rows}</section>`
    : emptyHTML(q);
  $("#chips").innerHTML = "";
  $("#picks").setAttribute("aria-pressed", "true");
}

/* ---------- main render ---------- */
function render() {
  $("#picks").hidden = !SIGNATURES[state.tab];
  document.documentElement.style.setProperty("--accent", TAB_COLOURS[state.tab]);
  document.querySelectorAll(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === state.tab));
  document.querySelectorAll(".diet button").forEach(b => b.setAttribute("aria-pressed", b.dataset.diet === state.diet));
  if (state.picks && SIGNATURES[state.tab]) { renderPicks(); return after(); }
  $("#picks").setAttribute("aria-pressed", "false");
  const q = state.q.trim().toLowerCase();
  const match = (...parts) => !q || parts.join(" ").toLowerCase().includes(q);
  let html = "", chips = "";
  for (const sec of MENU[state.tab]) {
    const hits = sec.items.filter(it => dietOk(it) && match(it.name, it.desc, it.option, sec.es, sec.en));
    if (!hits.length) continue;
    chips += `<button class="chip" data-target="${sec.id}">${esc(sec.es)}</button>`;
    const extras = sec.extras && sec.extras.items.filter(dietOk);
    html += `<section class="sec" id="${sec.id}"><div class="sec-head"><h2>${esc(sec.es)}</h2>${sec.en ? `<span class="en">(${esc(sec.en)})</span>` : ""}</div>`
      + (sec.note ? `<p class="sec-note">${esc(sec.note)}</p>` : "")
      + hits.map(itemHTML).join("")
      + (extras && extras.length ? `<div class="extras"><b>${esc(sec.extras.title)}</b><ul>${extras.map(x => `<li>${markHTML(x)}<span class="n">${esc(x.name)}</span><span class="p">${esc(x.price)}</span></li>`).join("")}</ul></div>` : "")
      + `</section>`;
  }
  $("#pages").innerHTML = html ? legendHTML() + html : emptyHTML(q);
  $("#chips").innerHTML = chips;
  after();
}
function after() {
  spy();
  document.documentElement.style.scrollPaddingTop = ($("#bar").offsetHeight + 12) + "px";
  if (window.ORDER) ORDER.refresh();
}

function spy() {
  const secs = [...document.querySelectorAll("section.sec")];
  const barH = $("#bar").getBoundingClientRect().bottom + 10;
  let cur = secs[0];
  for (const s of secs) if (s.getBoundingClientRect().top <= barH) cur = s;
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1];
  const row = $("#chips");
  row.querySelectorAll(".chip").forEach(c => {
    const on = cur && c.dataset.target === cur.id;
    // Scroll only the chip row sideways; scrollIntoView would also move the page
    if (on && !c.classList.contains("on")) row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2 });
    c.classList.toggle("on", on);
  });
}

/* ---------- remember choices: URL (?tab= / ?diet=) wins over this device ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} },
};
function saveState() {
  store.set("bombon-tab", state.tab); store.set("bombon-diet", state.diet);
  try {
    const u = new URL(location.href);
    u.searchParams.set("tab", state.tab);
    if (state.diet === "all") u.searchParams.delete("diet"); else u.searchParams.set("diet", state.diet);
    u.hash = "";
    history.replaceState(null, "", u);
  } catch (_) {}
}
const toTop = () => window.scrollTo({ top: $(".cover").offsetHeight + $(".tiles").offsetHeight, behavior: "auto" });

/* ---------- events ---------- */
document.querySelector(".tabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  state.tab = b.dataset.tab; state.picks = false; render(); toTop(); saveState();
});
document.querySelector(".tabs").addEventListener("keydown", e => {
  const keys = Object.keys(TABS), i = keys.indexOf(state.tab);
  const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
  state.tab = keys[(i + d + keys.length) % keys.length]; render(); saveState();
  document.querySelector(`.tabs [data-tab="${state.tab}"]`).focus();
});
document.querySelector(".diet").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  state.diet = state.diet === b.dataset.diet ? "all" : b.dataset.diet;      // tap again to show everything
  render(); saveState();
  const n = document.querySelectorAll("#pages .item").length;
  $("#live").textContent = state.diet === "all" ? `Showing all ${n} dishes` : `Showing ${n} ${state.diet === "veg" ? "vegetarian" : "non-vegetarian"} dishes`;
});
$("#chips").addEventListener("click", e => {
  const c = e.target.closest(".chip"); if (!c) return;
  document.getElementById(c.dataset.target).scrollIntoView();
});
$("#picks").addEventListener("click", () => { state.picks = !state.picks; render(); toTop(); });
$("#pages").addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) { state.tab = go.dataset.go; state.picks = false; render(); toTop(); saveState(); return; }
  const b = e.target.closest(".jump"); if (!b) return;
  state.picks = false; state.q = ""; $("#q").value = ""; render();
  const dish = [...document.querySelectorAll(`#${b.dataset.sec} .item`)].find(el => ITEM_BY_ID[el.dataset.id].item.name === b.dataset.name);
  (dish || document.getElementById(b.dataset.sec)).scrollIntoView({ block: dish ? "center" : "start" });
});
$("#q").addEventListener("input", e => { state.q = e.target.value; render(); });
window.addEventListener("scroll", () => requestAnimationFrame(spy), { passive: true });
window.addEventListener("resize", () => { document.documentElement.style.scrollPaddingTop = ($("#bar").offsetHeight + 12) + "px"; });

/* Print every tab, not just the one on screen */
let printBackup = null;
window.addEventListener("beforeprint", () => {
  printBackup = $("#pages").innerHTML;
  const keep = { ...state };
  let all = "";
  for (const t of Object.keys(MENU)) { Object.assign(state, { tab: t, picks: false, q: "" }); render(); all += `<div class="printing-tab"><h1>${TABS[t]}</h1>${$("#pages").innerHTML}</div>`; }
  Object.assign(state, keep);
  $("#pages").innerHTML = all;
});
window.addEventListener("afterprint", () => { if (printBackup != null) { render(); printBackup = null; } });

/* ---------- start ---------- */
{
  const t = store.get("bombon-tab"), d = store.get("bombon-diet");
  if (TABS[t]) state.tab = t;
  if (DIETS.includes(d)) state.diet = d;
  const p = new URLSearchParams(location.search);
  if (TABS[p.get("tab")]) state.tab = p.get("tab");
  const pd = p.get("diet") === "egg" ? "nonveg" : p.get("diet");            // old ?diet=egg links still work
  if (DIETS.includes(pd)) state.diet = pd;
  if (TABS[location.hash.slice(1)]) state.tab = location.hash.slice(1);
}
render();
