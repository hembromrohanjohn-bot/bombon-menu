const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");

/* ---------- diet marks (Indian veg / egg / non-veg symbols) ---------- */
const DIET_LABEL = {veg:"vegetarian", egg:"contains egg", nonveg:"non-vegetarian"};
function mark(d, extra="", decorative=false){
  const a11y = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${DIET_LABEL[d]}"`;
  return `<svg class="mark ${d}${extra}" viewBox="0 0 14 14" ${a11y}>`+
    (decorative?"":`<title>${DIET_LABEL[d]}</title>`)+
    `<rect x=".75" y=".75" width="12.5" height="12.5" rx="1.5"/>`+
    (d==="nonveg" ? `<path d="M7 3.3l3.7 6.5H3.3z"/>` : `<circle cx="7" cy="7" r="3.1"/>`)+`</svg>`;
}

function item(it){
  return `<div class="item" data-diet="${it.diet}"><div class="row"><span class="name">${mark(it.diet)}${esc(it.name)}${it.option?`<small>${esc(it.option)}</small>`:""}</span>`+
    (it.price!=null?`<span class="lead"></span><span class="price">${it.price}</span>`:"")+`</div>`+
    (it.desc?`<p class="desc">${esc(it.desc)}</p>`:"")+
    (it.addons&&it.addons.length?`<div class="addons"><div class="addon-h">add-ons</div>`+
      it.addons.map(a=>`<div class="addon" data-diet="${a.diet}">${mark(a.diet," sm")}<span>${esc(a.name)}</span><span class="lead"></span><b>${a.price}</b></div>`).join("")+`</div>`:"")+
    `</div>`;
}
const ILLO = {
 machine:`<figure class="illo" style="max-width:220px"><svg viewBox="0 0 200 150" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-label="line drawing of an espresso machine" role="img">
  <path d="M28 20c1-3 3-4 7-4l130 1c4 0 6 2 6 5l-1 98c0 3-2 5-5 5l-131-1c-3 0-5-2-5-5z"/><path d="M29 38l141 1"/><path d="M30 104l140 1"/>
  <circle cx="100" cy="28" r="7"/><path d="M100 24v4l3 2"/><rect x="48" y="23" width="26" height="8" rx="3"/><rect x="126" y="23" width="26" height="8" rx="3"/>
  <path d="M52 48h30M118 48h30"/><path d="M58 48v10h18V48M124 48v10h18V48"/><path d="M82 52h14M148 52h10"/>
  <path d="M62 80h14l-2 14c0 3-3 4-5 4s-5-1-5-4z"/><path d="M76 84c5 0 5 7 0 7"/><path d="M128 84h12l-1 10c0 2-2 3-5 3s-5-1-5-3z"/>
  <path d="M67 58v16M133 58v18" stroke-dasharray="2 4"/><path d="M40 112h120" stroke-dasharray="1 6"/><path d="M36 125v7M164 125v7"/></svg></figure>`,
 table:`<figure class="illo" style="max-width:260px"><svg viewBox="0 0 240 150" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-label="line drawing of a café table set for friends" role="img">
  <path d="M48 58l150-4 12 42-162 6z"/><path d="M60 102l-2 30M200 96l3 32"/>
  <ellipse cx="85" cy="72" rx="12" ry="5"/><ellipse cx="130" cy="70" rx="14" ry="6"/><ellipse cx="175" cy="68" rx="11" ry="5"/>
  <ellipse cx="100" cy="88" rx="10" ry="4"/><ellipse cx="160" cy="86" rx="12" ry="5"/><path d="M115 78v-8M112 70h6M143 84l5-6"/>
  <path d="M70 52c0-18 6-26 12-26s12 8 12 26M110 50c0-18 6-26 12-26s12 8 12 26M152 49c0-18 6-26 12-26s12 8 12 26"/>
  <path d="M76 36v14M88 36v14M116 34v14M128 34v14M158 33v14M170 33v14"/>
  <path d="M34 70l-10 4v40M34 70v40M24 94h10M218 64l10 4v38M218 64v40"/>
  <path d="M80 112c-2 10 4 18 10 22M150 110c2 10-2 18-8 22"/></svg><figcaption>Linger longer.</figcaption></figure>`,
};
function block(b){
  if(b.illo) return ILLO[b.illo];
  if(b.card) return `<div class="note-card">${b.card}</div>`;
  const inner = (b.h?`<h3>${esc(b.h)}</h3>`:"")+(b.note?`<p class="gnote">${esc(b.note)}</p>`:"")+
    (b.sub||[]).map(s=>`<div class="sub"><h4>${esc(s.h)}</h4><div class="items">${s.items.map(item).join("")}</div></div>`).join("")+
    (b.items?`<div class="items">${b.items.map(item).join("")}</div>`:"");
  return `<section class="group${b.feature?" feature":""}">${inner}</section>`;
}
const brush = `<svg class="brush" viewBox="0 0 300 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c30-4 55 2 85-1s60-5 95 0 70 3 116-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M40 11c40-2 90 1 150-1" fill="none" stroke="currentColor" stroke-width=".8" stroke-linecap="round" opacity=".6"/></svg>`;

document.querySelectorAll("[data-mark]").forEach(el=>{el.outerHTML = mark(el.dataset.mark,"",true)});
const PFOOT = document.querySelector("footer .legend").outerHTML + `<div>${document.querySelector("footer .fine").textContent}</div>`;
document.getElementById("menu").innerHTML = MENU.map((s,i)=>`
  <article class="chapter" id="${s.id}">
    <p class="phead"></p>
    <div class="kicker"><span>No.</span><i>${String(i+1).padStart(2,"0")}</i></div>
    <h2>${esc(s.title).replace(/\.(?=\S)/g,".<wbr>")}</h2>${brush}
    <div class="cols">${s.blocks.map(block).join("")}</div>
    <div class="pfoot">${PFOOT}</div>
  </article>`).join("");
document.getElementById("nav").innerHTML = MENU.map(s=>`<li data-id="${s.id}"><a href="#${s.id}">${esc(s.title.replace(/\.Breads.*$/,""))}</a></li>`).join("");

// highlight current section in nav
const links=[...document.querySelectorAll("nav a")];
const navList=document.getElementById("nav");
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  links.forEach(a=>a.classList.toggle("on",a.hash==="#"+e.target.id));
  const on=navList.querySelector("a.on");
  if(on) navList.scrollTo({left:on.offsetLeft-navList.clientWidth/2+on.offsetWidth/2,behavior:"smooth"});
}),{rootMargin:"-45% 0px -50% 0px"});
document.querySelectorAll(".chapter").forEach(c=>io.observe(c));

/* ---------- diet filter ---------- */
const DIETS = ["all","veg","egg","nonveg"];
const STORE = "bombon-diet";
const $ = id => document.getElementById(id);
const main = $("menu"), bar = document.querySelector(".bar"), seg = $("seg"), eggBox = $("incegg");
const radios = [...seg.querySelectorAll("[role=radio]")];
const allItems = [...document.querySelectorAll(".item")];
const chapters = [...document.querySelectorAll(".chapter")];
const total = d => allItems.filter(el=>el.dataset.diet===d).length;
const COUNT = {all:allItems.length, veg:total("veg"), egg:total("egg"), nonveg:total("nonveg")};

radios.forEach(r=>{ if(r.dataset.diet!=="all") r.querySelector(".lbl").insertAdjacentHTML("afterbegin", mark(r.dataset.diet,"",true)); });

function readState(){
  let st = {diet:"all", egg:false};
  try{
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if(saved && DIETS.includes(saved.diet)) st = {diet:saved.diet, egg:!!saved.egg};
  }catch(e){}
  const q = new URLSearchParams(location.search);
  if(DIETS.includes(q.get("diet"))) st = {diet:q.get("diet"), egg:q.get("egg")==="1"};   // URL wins
  return st;
}
function saveState(){
  try{ localStorage.setItem(STORE, JSON.stringify(state)); }catch(e){}
  try{
    const u = new URL(location.href);
    if(state.diet==="all") u.searchParams.delete("diet"); else u.searchParams.set("diet", state.diet);
    if(state.diet==="veg" && state.egg) u.searchParams.set("egg","1"); else u.searchParams.delete("egg");
    history.replaceState(null, "", u);
  }catch(e){}
}

const allowed = d => state.diet==="all" || d===state.diet || (state.diet==="veg" && state.egg && d==="egg");
function describe(n){
  const v = state.diet==="veg" && state.egg;
  return {
    title: {all:"", veg: v?"Vegetarian & egg menu":"Vegetarian menu", egg:"Egg dishes", nonveg:"Non-vegetarian menu"}[state.diet],
    say: n===0 ? "No items match this filter"
       : state.diet==="all" ? `Showing all ${n} items`
       : `Showing ${n} ${ {veg: v?"vegetarian and egg":"vegetarian", egg:"egg", nonveg:"non-vegetarian"}[state.diet] } item${n===1?"":"s"}`
  };
}

function apply(userAction){
  const onLink = navList.querySelector("a.on");
  const cur = onLink && document.getElementById(onLink.hash.slice(1));
  const has = el => !!el.querySelector(".item:not([hidden])");
  allItems.forEach(el => el.hidden = !allowed(el.dataset.diet));
  main.querySelectorAll(".addon").forEach(el => el.hidden = !allowed(el.dataset.diet));
  main.querySelectorAll(".addons").forEach(el => el.hidden = !el.querySelector(".addon:not([hidden])"));
  main.querySelectorAll(".sub, .group").forEach(el => el.hidden = !has(el));
  let n = 0;
  chapters.forEach(c=>{
    const on = has(c);
    c.hidden = !on;
    navList.querySelector(`[data-id="${c.id}"]`).hidden = !on;
    c.classList.toggle("first", on && n===0);
    if(on) c.querySelector(".kicker i").textContent = String(++n).padStart(2,"0");
  });
  const shown = allItems.filter(el=>!el.hidden).length;
  const {title, say} = describe(shown);
  $("empty").hidden = shown>0;
  main.querySelectorAll(".phead").forEach(p => p.textContent = title);
  $("pfilter").textContent = title;
  document.body.dataset.diet = state.diet;

  radios.forEach(r=>{
    const on = r.dataset.diet===state.diet, d = r.dataset.diet;
    const c = d==="veg" && state.egg ? COUNT.veg+COUNT.egg : COUNT[d];
    r.setAttribute("aria-checked", on);
    r.tabIndex = on ? 0 : -1;
    r.querySelector(".n").textContent = c;
  });
  eggBox.checked = state.egg;
  $("eggopt").hidden = state.diet!=="veg";
  document.documentElement.style.scrollPaddingTop = (bar.offsetHeight+8)+"px";

  if(userAction){
    $("live").textContent = say;
    saveState();
    main.classList.remove("fade"); void main.offsetWidth; main.classList.add("fade");
    // stay in the current section if it survived the filter, else jump to the first one left
    const target = (cur && !cur.hidden) ? cur : chapters.find(c=>!c.hidden);
    if(target && main.getBoundingClientRect().top < bar.offsetHeight) target.scrollIntoView({block:"start"});
  }
}

const state = readState();
function choose(d, focus){
  state.diet = d;
  apply(true);
  if(focus) radios.find(r=>r.dataset.diet===d).focus();
}
radios.forEach(r => r.addEventListener("click", ()=>choose(r.dataset.diet)));
seg.addEventListener("keydown", e=>{
  const i = radios.findIndex(r=>r.dataset.diet===state.diet);
  const k = {ArrowRight:1, ArrowDown:1, ArrowLeft:-1, ArrowUp:-1}[e.key];
  let j = k ? (i+k+radios.length)%radios.length : e.key==="Home" ? 0 : e.key==="End" ? radios.length-1 : null;
  if(j===null) return;
  e.preventDefault();
  choose(radios[j].dataset.diet, true);
});
eggBox.addEventListener("change", ()=>{ state.egg = eggBox.checked; apply(true); });
$("reset").addEventListener("click", ()=>choose("all", true));
addEventListener("resize", ()=>{ document.documentElement.style.scrollPaddingTop = (bar.offsetHeight+8)+"px"; });
apply(false);
