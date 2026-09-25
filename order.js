/* ============================================================
   Table ordering — only active when the page is opened from a
   table QR code (index.html?table=10). The guest builds an order,
   then WhatsApp opens with it pre-filled, addressed to the café.
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

  /* ---------- basket (saved so it survives a trip to WhatsApp and back) ---------- */
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
        <a class="send" id="send" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>Send order on WhatsApp</a>
        <p class="err" id="send-err" role="alert" hidden></p>
        <p class="small">WhatsApp opens with your order written out — just press <b>Send</b> there. Prices are before the ${Math.round(CONFIG.serviceCharge*100)}% service charge where shown.</p>
      </div>
      <div id="sheet-sent" class="sent" hidden>
        <div class="hand">Almost there!</div>
        <p>WhatsApp should now be open with your order for <b>Table ${TABLE}</b>. Press <b>Send</b> in WhatsApp to place it — we'll bring it over.</p>
        <p class="small">Didn't open? <a id="send-again" target="_blank" rel="noopener">Try again</a></p>
        <button type="button" class="btn" id="new-order">Start a new order</button>
        <button type="button" class="btn ghost" id="back-edit">Back to my order</button>
      </div>
    </div>
  </dialog>`);
  const $ = id => document.getElementById(id);
  const sheet = $("sheet"), linesEl = $("lines");
  $("o-name").value = cart.name; $("o-note").value = cart.note;

  // Order reference, e.g. T10-1432-K7Q — the same ref appears in WhatsApp and in the order log sheet.
  function newRef(){
    const now = new Date(), hhmm = String(now.getHours()).padStart(2,"0") + String(now.getMinutes()).padStart(2,"0");
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tag = ""; for(let i = 0; i < 3; i++) tag += abc[Math.floor(Math.random() * abc.length)];
    return `T${TABLE}-${hhmm}-${tag}`;
  }
  let ref = newRef(), sent = false;
  const touched = () => { if(sent){ ref = newRef(); sent = false; } };   // edited after sending → it's a new order

  function message(){
    const out = [`*NEW ORDER · TABLE ${TABLE}*`, `Ref ${ref}` + (cart.name.trim() ? ` · ${cart.name.trim()}` : ""), ""];
    lines().forEach(l => {
      out.push(`${l.qty} × ${LABEL[l.k]} — ${money(l.qty * l.price)}`);
      if(l.note.trim()) out.push(`   ↳ ${l.note.trim()}`);
    });
    const sub = subtotal(), svc = sub * CONFIG.serviceCharge;
    out.push("", `Items: ${money(sub)}`, `Service ${Math.round(CONFIG.serviceCharge*100)}%: ${money(svc)}`, `*Total: ${money(sub + svc)}*`);
    if(cart.note.trim()) out.push("", `Note: ${cart.note.trim()}`);
    return out.join("\n");
  }
  const waLink = () => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message())}`;

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
    $("totals").innerHTML = n ? `<dt>Items</dt><dd>${money(sub)}</dd><dt>Service ${Math.round(CONFIG.serviceCharge*100)}%</dt><dd>${money(svc)}</dd><dt class="t">Estimated total</dt><dd class="t">${money(sub+svc)}</dd>` : "";
    $("send").href = waLink(); $("send-again").href = waLink();
    $("send").classList.toggle("off", n === 0);
  }

  linesEl.addEventListener("click", e => {
    const b = e.target.closest(".step button"); if(!b) return;
    const k = b.parentNode.dataset.key;
    setQty(k, cart.lines[k].qty + (b.classList.contains("plus") ? 1 : -1), true);
  });
  linesEl.addEventListener("input", e => {
    if(!e.target.classList.contains("l-note")) return;
    touched(); cart.lines[e.target.dataset.k].note = e.target.value; save();
    $("send").href = waLink(); $("send-again").href = waLink();
  });
  $("o-name").addEventListener("input", e => { touched(); cart.name = e.target.value; save(); $("send").href = waLink(); });
  $("o-note").addEventListener("input", e => { touched(); cart.note = e.target.value; save(); $("send").href = waLink(); });

  const showSent = on => { $("sheet-edit").hidden = on; $("sheet-sent").hidden = !on; };
  $("ob-open").addEventListener("click", () => {
    if($("sheet-sent").hidden) { ref = newRef(); render(); }    // fresh ref per order, kept while "sent" is showing
    showSent(false); $("send-err").hidden = true; sheet.showModal();
  });

  // Copy of the order for the café's Google Sheet (config.js → ordersUrl). sendBeacon still
  // delivers while the phone switches to WhatsApp; the sheet ignores a repeated ref.
  function logOrder(){
    sent = true;
    if(!CONFIG.ordersUrl) return;
    const body = JSON.stringify({
      ref, table:TABLE, name:cart.name.trim(), note:cart.note.trim(),
      items: lines().map(l => ({name:LABEL[l.k], qty:l.qty, price:l.price, note:l.note.trim()})),
    });
    try{
      if(navigator.sendBeacon && navigator.sendBeacon(CONFIG.ordersUrl, new Blob([body], {type:"text/plain"}))) return;
    }catch(e){}
    fetch(CONFIG.ordersUrl, {method:"POST", mode:"no-cors", keepalive:true, headers:{"Content-Type":"text/plain"}, body}).catch(()=>{});
  }
  $("sheet-x").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", e => { if(e.target === sheet) sheet.close(); });   // tap the backdrop to close
  $("send").addEventListener("click", e => {
    const err = !count() ? "Add something to your order first."
      : !/^\d{8,15}$/.test(CONFIG.whatsapp) ? "Ordering by WhatsApp isn't switched on yet — please order with your server." : "";
    if(err){ e.preventDefault(); $("send-err").textContent = err; $("send-err").hidden = false; return; }
    logOrder();
    showSent(true);
  });
  $("send-again").addEventListener("click", logOrder);
  $("back-edit").addEventListener("click", () => showSent(false));
  $("new-order").addEventListener("click", () => {
    cart = {lines:{}, name:cart.name, note:""}; $("o-note").value = ""; ref = newRef(); sent = false;
    save(); render(); sheet.close();
    live.textContent = "Started a new order.";
  });

  render();
})();
