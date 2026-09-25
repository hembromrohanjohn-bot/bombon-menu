/* ============================================================
   Table ordering — only active when the page is opened from a
   table QR code (index.html?table=10). Guests tap + ADD, review the
   order and tap "Place order"; it is saved to Firebase (config.js)
   and shows up on the orders board straight away.
   ============================================================ */
(function () {
  const t = new URLSearchParams(location.search).get("table") || "";
  const TABLE = /^\d{1,3}$/.test(t) ? parseInt(t, 10) : 0;
  if (!(TABLE >= 1 && TABLE <= CONFIG.tables)) return;

  const STORE = "bombon-order-" + TABLE, TTL = 3 * 3600e3;     // a basket is kept for 3 hours
  const money = n => CONFIG.currency + Math.round(n).toLocaleString("en-IN");
  const pct = Math.round(CONFIG.serviceCharge * 100);
  const live = document.getElementById("live");
  const byId = id => ITEM_BY_ID[id] && ITEM_BY_ID[id].item;
  const label = id => { const r = ITEM_BY_ID[id]; return r.sec.ctx ? `${r.sec.ctx}: ${r.item.name}` : r.item.name; };

  /* ---------- basket, saved on the phone so a reload or dropped connection doesn't lose it ---------- */
  let cart = { lines: {}, name: "", note: "" };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || "null");
    if (saved && Date.now() - saved.ts < TTL) {
      cart.name = saved.name || ""; cart.note = saved.note || "";
      for (const [id, l] of Object.entries(saved.lines || {}))      // drop lines if the menu changed
        if (byId(id) && byId(id).name === l.name && byId(id).price != null && l.qty > 0) cart.lines[id] = l;
    }
  } catch (e) {}
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ ...cart, ts: Date.now() })); } catch (e) {} };
  const lines = () => Object.entries(cart.lines).map(([id, l]) => ({ id, ...l, price: byId(id).price }));
  const count = () => lines().reduce((a, l) => a + l.qty, 0);
  const subtotal = () => lines().reduce((a, l) => a + l.qty * l.price, 0);
  const qty = id => (cart.lines[id] || { qty: 0 }).qty;

  // Order reference, e.g. T10-1432-K7Q. A retry after a failed send keeps the same ref, so the
  // kitchen never gets it twice; any change after an attempt makes it a new order with a new ref.
  function newRef() {
    const now = new Date(), hhmm = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tag = ""; for (let i = 0; i < 3; i++) tag += abc[Math.floor(Math.random() * abc.length)];
    return `T${TABLE}-${hhmm}-${tag}`;
  }
  // Each order also gets a random Firestore document id. A retry reuses both, so a slow first
  // attempt that did reach the kitchen is recognised instead of creating a second order.
  const newDocId = () => { const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; let s = ""; const r = crypto.getRandomValues(new Uint8Array(20)); for (const b of r) s += a[b % a.length]; return s; };
  let ref = newRef(), docId = newDocId(), attempted = false, sending = false;
  const touched = () => { if (attempted) { ref = newRef(); docId = newDocId(); attempted = false; } };

  /* ---------- Firebase (loaded only when a guest places an order) ---------- */
  let fb = null;
  async function firebase() {
    if (fb) return fb;
    const SDK = "https://www.gstatic.com/firebasejs/12.19.0/";
    const { initializeApp } = await import(SDK + "firebase-app.js");
    const fs = await import(SDK + "firebase-firestore.js");
    fb = { ...fs, db: fs.getFirestore(initializeApp(CONFIG.firebase)) };
    return fb;
  }
  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(Object.assign(new Error("Timed out"), { name: "AbortError" })), ms))]);
  async function saveOrder(id, order) {
    const f = await withTimeout(firebase(), 15000);
    const ref = f.doc(f.db, "restaurants", "bombon", "orders", id);
    try {
      await withTimeout(f.setDoc(ref, { ...order, status: "new", placedAt: f.serverTimestamp() }), 15000);
    } catch (err) {
      // A slow write may still have reached the kitchen, or this is a retry of one that did.
      try { if ((await withTimeout(f.getDocFromServer(ref), 8000)).exists()) return; } catch (_) {}
      throw err;
    }
  }

  /* ---------- placed orders: remembered on this phone and followed live ---------- */
  const PLACED = "bombon-placed-" + TABLE, KEEP = 12 * 3600e3;
  let placed = [];
  try { placed = (JSON.parse(localStorage.getItem(PLACED) || "[]") || []).filter(o => o && o.id && Date.now() - o.at < KEEP); } catch (e) {}
  const savePlaced = () => { try { localStorage.setItem(PLACED, JSON.stringify(placed)); } catch (e) {} };
  const STEP = { new: 0, preparing: 1, served: 2 };
  const STATUS_TEXT = { new: "Received", preparing: "Preparing", served: "Served", cancelled: "Cancelled" };
  const finished = o => o.status === "served" || o.status === "cancelled";
  // The bar keeps offering "Track your order" until 30 minutes after the last order is served.
  const trackable = () => placed.filter(o => !finished(o) || Date.now() - (o.statusAt || o.at) < 30 * 60e3);
  const watching = {};
  async function watch(o) {
    if (watching[o.id] || !CONFIG.firebase || finished(o) && Date.now() - (o.statusAt || o.at) > 30 * 60e3) return;
    watching[o.id] = true;
    try {
      const f = await firebase();
      f.onSnapshot(f.doc(f.db, "restaurants", "bombon", "orders", o.id), snap => {
        if (!snap.exists()) return;
        const st = snap.get("status"), at = snap.get("statusAt");
        if (st === o.status) return;
        o.status = st; o.statusAt = at && at.toMillis ? at.toMillis() : Date.now();
        savePlaced(); bar(); if (sheet.open) redrawOrders();
        live.textContent = `Order ${o.ref}: ${STATUS_TEXT[st] || st}.`;
      }, () => { watching[o.id] = false; });
    } catch (e) { watching[o.id] = false; }
  }
  function trackerHTML(o) {
    const step = STEP[o.status] ?? 0, when = new Date(o.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const steps = ["Received", "Preparing", "Served"].map((t, i) =>
      `<li class="${o.status !== "cancelled" && i <= step ? "done" : ""}${o.status !== "cancelled" && i === step ? " now" : ""}"><span class="dot" aria-hidden="true"></span>${t}</li>`).join("");
    return `<div class="track" data-order="${esc(o.id)}">
      <div class="track-head"><b>${esc(o.ref)}</b><span>${when} · ${o.n} item${o.n === 1 ? "" : "s"} · ${money(o.total)}</span></div>
      ${o.status === "cancelled" ? `<p class="track-cancel">This order was cancelled. Please ask your server.</p>` : `<ol class="steps" aria-label="Order status: ${STATUS_TEXT[o.status] || "Received"}">${steps}</ol>`}
      <p class="track-items">${o.items.map(i => `${i.qty}× ${esc(i.name)}`).join(", ")}</p>
    </div>`;
  }
  const ordersHTML = (heading = true) => placed.length
    ? (heading ? `<h3 class="orders-h">Your orders at Table ${TABLE}</h3>` : "") + placed.slice().reverse().map(trackerHTML).join("")
    : "";
  function redrawOrders() {
    const box = $("#s-orders"); if (box) box.innerHTML = ordersHTML(box.classList.contains("orders-below"));
  }

  /* ---------- + ADD / − n + controls (drawn by app.js through ORDER.ctl) ---------- */
  const stepperHTML = (id, q) => {
    const n = esc(byId(id).name);
    return `<span class="stepper"><button type="button" data-act="minus" aria-label="Remove one ${n}">−</button><span class="q" aria-label="${q} in your order">${q}</span><button type="button" data-act="plus" aria-label="Add another ${n}">+</button></span>`;
  };
  window.ORDER = {
    ctl: id => { const q = qty(id); return q ? stepperHTML(id, q) : `<button type="button" class="add" data-act="plus" aria-label="Add ${esc(byId(id).name)}">+ Add</button>`; },
    refresh: () => bar(),
  };

  function setQty(id, q) {
    touched();
    q = Math.max(0, Math.min(20, q));
    if (q === 0) delete cart.lines[id];
    else cart.lines[id] = { name: byId(id).name, qty: q, note: (cart.lines[id] || {}).note || "" };
    save();
    document.querySelectorAll(`.ctl[data-id="${CSS.escape(id)}"]`).forEach(el => el.innerHTML = ORDER.ctl(id));
    bar();
    if (sheet.open) drawSheet();
    const n = count();
    live.textContent = `${byId(id).name}: ${q}. ${n} item${n === 1 ? "" : "s"} in your order.`;
  }
  function onStep(e) {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const holder = b.closest("[data-id]"); if (!holder) return;
    const id = holder.dataset.id, act = b.dataset.act, inSheet = holder.classList.contains("oline");
    setQty(id, qty(id) + (act === "plus" ? 1 : -1));
    // keep keyboard focus on the control that replaced the one pressed
    const again = document.querySelector(`${inSheet ? "#s-body .oline" : ".ctl"}[data-id="${CSS.escape(id)}"]`);
    const f = again && (again.querySelector(`[data-act="${act}"]`) || again.querySelector("[data-act]"));
    if (f) f.focus(); else if (sheet.open) $("#s-x").focus();
  }
  document.getElementById("pages").addEventListener("click", onStep);

  /* ---------- floating order bar + sheet ---------- */
  document.documentElement.classList.add("ordering");
  const strip = document.getElementById("table-strip");
  strip.textContent = `Table ${TABLE}`; strip.hidden = false;
  document.body.insertAdjacentHTML("beforeend", `
  <div class="orderbar" id="orderbar" hidden><button type="button" id="ob-open"><span id="ob-sum"></span><span class="cta" id="ob-cta">Review order</span></button></div>
  <dialog class="sheet" id="sheet" aria-labelledby="s-title">
    <div class="s-head"><h2 id="s-title">Your order<span class="pill">Table ${TABLE}</span></h2><button type="button" class="x" id="s-x" aria-label="Close">×</button></div>
    <div class="s-body" id="s-body"></div>
    <div class="s-foot" id="s-foot">
      <p class="error" id="s-err" role="alert" hidden></p>
      <div class="sum" id="s-sum"></div>
      <button type="button" class="primary" id="s-send">Place order</button>
      <p class="fine">Your order goes straight to our kitchen. Pay at the counter when you're done.</p>
    </div>
  </dialog>`);
  const $ = s => document.querySelector(s);
  const sheet = $("#sheet");

  function bar() {
    const n = count(), t = trackable();
    const show = n > 0 || t.length > 0;
    $("#orderbar").hidden = !show;
    document.documentElement.classList.toggle("has-order", show);
    $("#orderbar").classList.toggle("tracking", n === 0 && t.length > 0);
    if (n > 0) {
      $("#ob-sum").innerHTML = `<span class="tbl">Table ${TABLE} <span class="dot">·</span> </span>${n} item${n === 1 ? "" : "s"} <span class="dot">·</span> ${money(subtotal())}`;
      $("#ob-cta").textContent = "Review order";
    } else if (t.length) {
      const latest = t[t.length - 1], open = t.filter(o => !finished(o)).length;
      $("#ob-sum").innerHTML = `<span class="live-dot ${esc(latest.status)}" aria-hidden="true"></span>`
        + (t.length > 1 ? `${t.length} orders <span class="dot">·</span> ${open ? `${open} in progress` : "all served"}` : `Your order <span class="dot">·</span> ${STATUS_TEXT[latest.status] || "Received"}`);
      $("#ob-cta").textContent = "Track";
    }
  }

  function drawSheet() {
    const ls = lines(), sub = subtotal(), svc = sub * CONFIG.serviceCharge;
    $("#s-title").firstChild.textContent = ls.length || !placed.length ? "Your order" : "Your orders";
    if (!ls.length && placed.length) {                     // nothing in the basket: just track what was ordered
      $("#s-body").innerHTML = `<div id="s-orders">${ordersHTML(false)}</div><button type="button" class="primary ghost" id="s-add">Add more dishes</button>`;
      $("#s-add").addEventListener("click", () => sheet.close());
      $("#s-foot").hidden = true;
      return;
    }
    $("#s-body").innerHTML = (ls.length ? ls.map(l => {
      const it = byId(l.id);
      return `<div class="oline" data-id="${esc(l.id)}">
        <div class="oline-name">${markHTML(it)}${esc(label(l.id))}</div><div class="oline-total">${money(l.qty * l.price)}</div>
        <div class="oline-actions">${stepperHTML(l.id, l.qty)}<input class="oline-note" data-id="${esc(l.id)}" value="${esc(l.note)}" maxlength="80" placeholder="Add a note (optional)" aria-label="Note for ${esc(it.name)}"></div>
      </div>`;
    }).join("") : `<p class="fine">Your order is empty. Tap + Add on any dish.</p>`)
      + `<label class="fld">Your name <em>(optional)</em><input id="o-name" autocomplete="given-name" maxlength="40" value="${esc(cart.name)}"></label>`
      + `<label class="fld">Anything else for the kitchen? <em>(optional)</em><textarea id="o-note" rows="2" maxlength="300" placeholder="Allergies, or bring everything together">${esc(cart.note)}</textarea></label>`
      + `<div id="s-orders" class="orders-below">${ordersHTML()}</div>`;
    $("#s-sum").innerHTML = ls.length ? `<span>Items</span><span>${money(sub)}</span><span>Service ${pct}%</span><span>${money(svc)}</span><span class="grand">Estimated total</span><span class="grand">${money(sub + svc)}</span>` : "";
    $("#s-send").disabled = !ls.length || sending;
    $("#s-foot").hidden = false;
  }

  $("#s-body").addEventListener("click", onStep);
  $("#s-body").addEventListener("input", e => {
    touched();
    if (e.target.classList.contains("oline-note")) cart.lines[e.target.dataset.id].note = e.target.value;
    else if (e.target.id === "o-name") cart.name = e.target.value;
    else if (e.target.id === "o-note") cart.note = e.target.value;
    save();
  });
  $("#ob-open").addEventListener("click", () => { $("#s-err").hidden = true; drawSheet(); sheet.showModal(); });
  $("#s-x").addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });     // tap outside to close
  const fail = msg => { $("#s-err").textContent = msg; $("#s-err").hidden = false; live.textContent = msg; };

  /* ---------- place the order ---------- */
  $("#s-send").addEventListener("click", async () => {
    $("#s-err").hidden = true;
    if (!count()) return fail("Add something to your order first.");
    if (!CONFIG.firebase) return fail("Ordering from the table isn't switched on yet. Please order with your server.");
    const n = count(), sub = subtotal(), service = Math.round(sub * CONFIG.serviceCharge), total = sub + service;
    const order = {
      ref, table: TABLE, name: cart.name.trim().slice(0, 40), note: cart.note.trim().slice(0, 300),
      items: lines().map(l => ({ name: label(l.id), qty: l.qty, price: l.price, note: l.note.trim().slice(0, 80) })),
      qty: n, subtotal: sub, service, total,
    };
    attempted = true; sending = true;
    const btn = $("#s-send"); btn.disabled = true; btn.textContent = "Sending…";
    try {
      await saveOrder(docId, order);
      const mine = { id: docId, ref, n, total, at: Date.now(), status: "new", statusAt: null, items: order.items.map(i => ({ name: i.name, qty: i.qty })) };
      placed.push(mine); savePlaced(); watch(mine);
      cart = { lines: {}, name: cart.name, note: "" }; ref = newRef(); docId = newDocId(); attempted = false; save();
      document.querySelectorAll(".ctl[data-id]").forEach(el => el.innerHTML = ORDER.ctl(el.dataset.id));
      bar();
      $("#s-foot").hidden = true;
      $("#s-body").innerHTML = `<div class="done"><div class="tick" aria-hidden="true">✓</div><h3>Thank you!</h3>
        <p>Your order is with the kitchen. We'll bring it to <b>Table ${TABLE}</b>.</p>
        <p class="fine">You can follow it here, or any time from the bar at the bottom of the menu.</p></div>
        <div id="s-orders">${ordersHTML(false)}</div>
        <button type="button" class="primary" id="s-more" style="margin-top:14px">Back to the menu</button>`;
      $("#s-more").addEventListener("click", () => sheet.close());
      $("#s-more").focus();
      live.textContent = `Order received for table ${TABLE}.`;
    } catch (err) {
      console.warn("[order] not placed:", err);
      const msg = err.name === "AbortError" ? "No reply from the kitchen." :
        err.code === "permission-denied" ? "The kitchen couldn't accept this order." : "Couldn't reach the kitchen.";
      fail(msg + " Check your connection and tap Place order again, or ask your server.");
    } finally {
      sending = false; btn.textContent = "Place order";
      if (!$("#s-foot").hidden) $("#s-send").disabled = !count();
    }
  });

  placed.forEach(watch);   // follow orders placed earlier (e.g. after the page was reloaded)
  render();          // redraw the menu with + Add buttons (render() is in app.js)
})();
