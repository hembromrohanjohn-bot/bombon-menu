/* ============================================================
   Table ordering — only active when the page is opened from a
   table QR code (index.html?table=10). The guest builds an order,
   then taps "Place order" and it goes straight to the orders board.
   ============================================================ */
(function(){
  const t = new URLSearchParams(location.search).get("table") || "";
  const TABLE = /^\d{1,3}$/.test(t) ? parseInt(t, 10) : 0;
  if(!(TABLE >= 1 && TABLE <= CONFIG.tables)) return;

  const STORE = "bombon-order-" + TABLE, TTL = 3 * 3600e3;   // a basket is kept for 3 hours
  const money = n => CONFIG.currency + Math.round(n).toLocaleString("en-IN");
  const live = document.getElementById("live");

  // Short item names need their group to make sense in the kitchen ("Classic" → "Matcha: Classic")
  const CONTEXT = {"Matcha":"Matcha", "Hojicha":"Hojicha", "Manual Brew":"Manual Brew", "Cold Brew Bar":"Cold Brew",
                   "Kombucha":"Kombucha", "Refreshers":"Refresher", "Teas (bags)":"Tea"};
  function contextOf(el){
    const sub = el.closest(".sub"), grp = el.closest(".group");
    const h = (sub && sub.querySelector("h4")) || (grp && grp.querySelector("h3"));
    return h ? CONTEXT[h.textContent.trim()] || "" : "";
  }
  const orderable = [...document.querySelectorAll(".item")].filter(el => ITEMS[el.dataset.key].price != null);
  const LABEL = {};
  orderable.forEach(el => {
    const it = ITEMS[el.dataset.key], c = contextOf(el);
    LABEL[el.dataset.key] = c ? `${c}: ${it.name}` : it.name;
  });

  /* ---------- basket (saved on the phone so a reload or a dropped connection doesn't lose it) ---------- */
  let cart = {lines:{}, name:"", note:""};
  try{
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if(saved && Date.now() - saved.ts < TTL){
      cart.name = saved.name || ""; cart.note = saved.note || "";
      for(const [k, l] of Object.entries(saved.lines || {}))
        if(ITEMS[k] && ITEMS[k].name === l.name && ITEMS[k].price != null && l.qty > 0) cart.lines[k] = l;   // drop lines if the menu changed
    }
  }catch(e){}
  function save(){
    try{ localStorage.setItem(STORE, JSON.stringify({...cart, ts:Date.now()})); }catch(e){}
  }
  const lines = () => Object.entries(cart.lines).map(([k, l]) => ({k, ...l, price:ITEMS[k].price}));
  const count = () => lines().reduce((a, l) => a + l.qty, 0);
  const subtotal = () => lines().reduce((a, l) => a + l.qty * l.price, 0);

  function setQty(k, q, announce){
    touched();
    q = Math.max(0, Math.min(20, q));
    if(q === 0) delete cart.lines[k];
    else cart.lines[k] = {name:ITEMS[k].name, qty:q, note:(cart.lines[k] || {}).note || ""};
    save(); render();
    if(announce) live.textContent = `${ITEMS[k].name}: ${q}. ${count()} item${count()===1?"":"s"} in your order.`;
  }

  /* ---------- + / − on each dish ---------- */
  document.body.classList.add("ordering");
  orderable.forEach(el => {
    const k = el.dataset.key, name = ITEMS[k].name.replace(/"/g, "&quot;");
    el.querySelector(".row").insertAdjacentHTML("beforeend",
      `<span class="step" data-key="${k}"><button type="button" class="minus" aria-label="Remove one ${name}">−</button>`+
      `<span class="q"></span><button type="button" class="plus" aria-label="Add ${name}">+</button></span>`);
  });
  document.getElementById("menu").addEventListener("click", e => {
    const b = e.target.closest(".step button"); if(!b) return;
    const k = b.parentNode.dataset.key, cur = (cart.lines[k] || {qty:0}).qty;
    setQty(k, cur + (b.classList.contains("plus") ? 1 : -1), true);
  });

  /* ---------- order bar + review sheet ---------- */
  const pct = Math.round(CONFIG.serviceCharge * 100);
  document.body.insertAdjacentHTML("beforeend", `
  <div class="orderbar" role="region" aria-label="Your order">
    <button type="button" id="ob-open"><span class="ob-table">Table ${TABLE}</span><span class="ob-sum" id="ob-sum"></span><span class="ob-go">Review</span></button>
  </div>
  <dialog class="sheet" id="sheet" aria-labelledby="sheet-h">
    <div class="sheet-in">
      <header><h2 id="sheet-h">Your order <span>· Table ${TABLE}</span></h2><button type="button" class="x" id="sheet-x" aria-label="Close">×</button></header>
      <div id="sheet-edit">
        <ul class="lines" id="lines"></ul>
        <label class="fld">Your name <em>(optional)</em><input id="o-name" autocomplete="given-name" maxlength="40"></label>
        <label class="fld">Anything else for the kitchen? <em>(optional)</em><textarea id="o-note" rows="2" maxlength="300" placeholder="e.g. allergies, bring everything together"></textarea></label>
        <dl class="totals" id="totals"></dl>
        <button type="button" class="send" id="send">Place order</button>
        <p class="err" id="send-err" role="alert" hidden></p>
        <p class="small">Your order goes straight to our kitchen. Pay at the counter when you're done.</p>
      </div>
      <div id="sheet-done" class="sent" hidden>
        <div class="tick" aria-hidden="true">✓</div>
        <div class="hand">Order received!</div>
        <p>The kitchen has your order for <b>Table ${TABLE}</b>. We'll bring it over.</p>
        <p class="small" id="done-sum"></p>
        <button type="button" class="btn" id="order-more">Order something else</button>
      </div>
    </div>
  </dialog>`);
  const $ = id => document.getElementById(id);
  const sheet = $("sheet"), linesEl = $("lines");
  $("o-name").value = cart.name; $("o-note").value = cart.note;

  // Order reference, e.g. T10-1432-K7Q — shown to the guest and on the orders board.
  function newRef(){
    const now = new Date(), hhmm = String(now.getHours()).padStart(2,"0") + String(now.getMinutes()).padStart(2,"0");
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tag = ""; for(let i = 0; i < 3; i++) tag += abc[Math.floor(Math.random() * abc.length)];
    return `T${TABLE}-${hhmm}-${tag}`;
  }
  // A retry after a failed send keeps the same ref, so the kitchen never gets it twice;
  // any edit after an attempt makes it a new order with a new ref.
  let ref = newRef(), attempted = false, sending = false;
  const touched = () => { if(attempted){ ref = newRef(); attempted = false; } };

  function render(){
    // + / − steppers in the menu
    document.querySelectorAll(".step").forEach(s => {
      const q = (cart.lines[s.dataset.key] || {qty:0}).qty;
      s.classList.toggle("has", q > 0);
      s.querySelector(".q").textContent = q || "";
    });
    const n = count(), sub = subtotal();
    $("ob-sum").textContent = n ? `${n} item${n===1?"":"s"} · ${money(sub)}` : "tap + to add dishes";
    document.body.classList.toggle("has-order", n > 0);
    $("ob-open").disabled = n === 0;

    // review sheet
    const focused = document.activeElement && document.activeElement.closest(".lines [data-k]");
    const refocus = focused && [focused.dataset.k, document.activeElement.className];
    linesEl.innerHTML = lines().map(l => `
      <li data-k="${l.k}">
        <div class="l-top"><span class="l-name">${esc(LABEL[l.k])}</span><span class="l-price">${money(l.qty * l.price)}</span></div>
        <div class="l-ctl">
          <span class="step has in-sheet" data-key="${l.k}"><button type="button" class="minus" aria-label="Remove one ${esc(ITEMS[l.k].name)}">−</button><span class="q">${l.qty}</span><button type="button" class="plus" aria-label="Add ${esc(ITEMS[l.k].name)}">+</button></span>
          <input class="l-note" data-k="${l.k}" value="${esc(l.note).replace(/"/g,"&quot;")}" maxlength="80" placeholder="add a note (optional)" aria-label="Note for ${esc(ITEMS[l.k].name)}">
        </div>
      </li>`).join("") || `<li class="none">Your order is empty.</li>`;
    if(refocus){
      const li = linesEl.querySelector(`[data-k="${refocus[0]}"]`);
      const el = li && li.querySelector("." + refocus[1].split(" ")[0]);
      if(el) el.focus(); else $("sheet-x").focus();
    }
    const svc = sub * CONFIG.serviceCharge;
    $("totals").innerHTML = n ? `<dt>Items</dt><dd>${money(sub)}</dd><dt>Service ${pct}%</dt><dd>${money(svc)}</dd><dt class="t">Estimated total</dt><dd class="t">${money(sub+svc)}</dd>` : "";
    $("send").disabled = n === 0 || sending;
  }

  linesEl.addEventListener("click", e => {
    const b = e.target.closest(".step button"); if(!b) return;
    const k = b.parentNode.dataset.key;
    setQty(k, cart.lines[k].qty + (b.classList.contains("plus") ? 1 : -1), true);
  });
  linesEl.addEventListener("input", e => {
    if(!e.target.classList.contains("l-note")) return;
    touched(); cart.lines[e.target.dataset.k].note = e.target.value; save();
  });
  $("o-name").addEventListener("input", e => { touched(); cart.name = e.target.value; save(); });
  $("o-note").addEventListener("input", e => { touched(); cart.note = e.target.value; save(); });

  const showDone = on => { $("sheet-edit").hidden = on; $("sheet-done").hidden = !on; };
  const fail = msg => { $("send-err").textContent = msg; $("send-err").hidden = false; live.textContent = msg; };
  $("ob-open").addEventListener("click", () => { showDone(false); $("send-err").hidden = true; render(); sheet.showModal(); });
  $("sheet-x").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", e => { if(e.target === sheet) sheet.close(); });   // tap the backdrop to close
  $("order-more").addEventListener("click", () => sheet.close());

  /* ---------- place the order ---------- */
  $("send").addEventListener("click", async () => {
    $("send-err").hidden = true;
    if(!count()) return fail("Add something to your order first.");
    if(!CONFIG.ordersUrl) return fail("Ordering from the table isn't switched on yet. Please order with your server.");
    const n = count(), total = subtotal() * (1 + CONFIG.serviceCharge);
    const body = JSON.stringify({
      ref, table:TABLE, name:cart.name.trim(), note:cart.note.trim(),
      items: lines().map(l => ({name:LABEL[l.k], qty:l.qty, price:l.price, note:l.note.trim()})),
    });
    attempted = true; sending = true;
    const btn = $("send"); btn.disabled = true; btn.textContent = "Sending…";
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
    try{
      // text/plain keeps this a "simple" request, so it works cross-origin with Apps Script.
      const res = await fetch(CONFIG.ordersUrl, {method:"POST", body, headers:{"Content-Type":"text/plain;charset=utf-8"}, signal:ctl.signal});
      const out = await res.json();
      if(!out.ok) throw new Error(out.error || "not accepted");
      $("done-sum").textContent = `Ref ${ref} · ${n} item${n===1?"":"s"} · about ${money(total)} incl. service`;
      cart = {lines:{}, name:cart.name, note:""}; $("o-note").value = "";
      ref = newRef(); attempted = false; save();
      showDone(true);
      live.textContent = `Order received for table ${TABLE}.`;
    }catch(err){
      const msg = err.name === "AbortError" ? "No reply from the kitchen." :
                  /table|quantity|price|item|ref|order/i.test(err.message) ? `The order couldn't be placed (${err.message}).` :
                  "Couldn't reach the kitchen.";
      fail(msg + " Please check your connection and tap Place order again, or ask your server.");
    }finally{
      clearTimeout(timer); sending = false; btn.textContent = "Place order"; render();
    }
  });

  render();
})();
