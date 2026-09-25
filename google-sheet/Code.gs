/* ============================================================
   BOMBON — orders backend (Google Sheets + Apps Script)
   • Guests' phones send orders here from the table menu (?table=N).
   • The orders board (bombon-orders site) reads them and updates their
     status, using a staff key that only the café knows.

   One-time setup (full steps in README.md → "Orders backend"):
   1. Create a Google Sheet → Extensions → Apps Script → paste this whole file.
   2. Project Settings (gear) → Time zone: (GMT+05:30) India Standard Time.
   3. Select the `setup` function → Run → allow access. This builds the sheet
      and creates the staff key (shown in the "Settings" tab).
   4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → Deploy.
   5. Copy the Web app URL (ends in /exec) into config.js of the menu and of the orders board.
   ============================================================ */

const TABLES = 40;               // keep in sync with `tables` in config.js
const SERVICE_CHARGE = 0.10;
const ORDERS = "Orders";
const DAILY = "Daily totals";
const SETTINGS = "Settings";
const HEADERS = ["Received", "Ref", "Table", "Guest", "Items", "Qty", "Subtotal", "Service", "Total", "Note", "Status", "Updated", "Lines"];
const COL = Object.fromEntries(HEADERS.map((h, i) => [h, i + 1]));
const STATUSES = ["New", "Preparing", "Served", "Cancelled"];

/* ---------- HTTP entry points ---------- */
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return reply({ ok: false, error: "Bad request" }); }
  try {
    if (body.action === "status") return reply(setStatus(body));
    return reply(placeOrder(body));
  } catch (err) {
    return reply({ ok: false, error: String(err.message || err) });
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === "orders") { checkKey(p.key); return reply(listOrders(Number(p.hours) || 18)); }
    if (p.action === "check") { checkKey(p.key); return reply({ ok: true }); }
    return reply({ ok: true, service: "Bombon orders" });
  } catch (err) {
    return reply({ ok: false, error: String(err.message || err) });
  }
}

/* ---------- guests: place an order ---------- */
function placeOrder(raw) {
  const order = clean(raw);
  const cache = CacheService.getScriptCache();
  if (cache.get("ref:" + order.ref)) return { ok: true, ref: order.ref, duplicate: true };   // same order sent twice
  const burstKey = "t:" + order.table, burst = Number(cache.get(burstKey) || 0);
  if (burst >= 15) throw new Error("Too many orders from this table, please ask your server");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheetOf(ORDERS) || setup();
    const subtotal = order.items.reduce((a, i) => a + i.qty * i.price, 0);
    const service = Math.round(subtotal * SERVICE_CHARGE);
    const now = new Date();
    sheet.appendRow([
      now, order.ref, order.table, safe(order.name),
      order.items.map(i => `${i.qty} × ${i.name}` + (i.note ? ` (${i.note})` : "")).join("\n"),   // starts with a number, so it can't be a formula
      order.items.reduce((a, i) => a + i.qty, 0),
      subtotal, service, subtotal + service, safe(order.note), "New", now,
      JSON.stringify(order.items),
    ]);
    cache.put("ref:" + order.ref, "1", 6 * 3600);
    cache.put(burstKey, String(burst + 1), 600);
  } finally {
    lock.releaseLock();
  }
  return { ok: true, ref: order.ref };
}

/* ---------- staff: read orders & change status ---------- */
function listOrders(hours) {
  const sheet = sheetOf(ORDERS);
  if (!sheet || sheet.getLastRow() < 2) return { ok: true, orders: [], now: new Date().toISOString() };
  const since = Date.now() - Math.min(hours, 72) * 3600e3;
  const n = sheet.getLastRow() - 1, start = Math.max(2, sheet.getLastRow() - 499);   // newest 500 rows at most
  const rows = sheet.getRange(start, 1, sheet.getLastRow() - start + 1, HEADERS.length).getValues();
  const orders = [];
  rows.forEach(r => {
    const t = r[0] instanceof Date ? r[0].getTime() : Date.parse(r[0]);
    if (!(t >= since)) return;
    let items = [];
    try { items = JSON.parse(r[COL.Lines - 1] || "[]"); } catch (e) {}
    orders.push({
      ref: r[COL.Ref - 1], table: r[COL.Table - 1], guest: unsafe(r[COL.Guest - 1]), note: unsafe(r[COL.Note - 1]),
      items: items, qty: r[COL.Qty - 1], total: r[COL.Total - 1], status: r[COL.Status - 1] || "New",
      at: new Date(t).toISOString(),
      updated: r[COL.Updated - 1] instanceof Date ? r[COL.Updated - 1].toISOString() : null,
    });
  });
  return { ok: true, orders: orders, now: new Date().toISOString(), rows: n };
}

function setStatus(body) {
  checkKey(body.key);
  const ref = String(body.ref || ""), status = String(body.status || "");
  if (STATUSES.indexOf(status) < 0) throw new Error("Bad status");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheetOf(ORDERS);
    const hit = sheet && sheet.getRange(2, COL.Ref, Math.max(1, sheet.getLastRow() - 1), 1)
      .createTextFinder(ref).matchEntireCell(true).findNext();
    if (!hit) throw new Error("Order not found");
    sheet.getRange(hit.getRow(), COL.Status).setValue(status);
    sheet.getRange(hit.getRow(), COL.Updated).setValue(new Date());
  } finally {
    lock.releaseLock();
  }
  return { ok: true, ref: ref, status: status };
}

function checkKey(key) {
  const real = PropertiesService.getScriptProperties().getProperty("STAFF_KEY");
  if (!real || String(key || "") !== real) throw new Error("Wrong staff key");
}

/* ---------- validation: only well-formed orders get in ---------- */
function clean(o) {
  const str = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
  if (!o || typeof o !== "object") throw new Error("Bad order");
  const ref = str(o.ref, 20);
  if (!/^T\d{1,3}-\d{4}-[A-Z0-9]{3}$/.test(ref)) throw new Error("Bad ref");
  const table = Number(o.table);
  if (!Number.isInteger(table) || table < 1 || table > TABLES) throw new Error("Bad table");
  if (!Array.isArray(o.items) || o.items.length < 1 || o.items.length > 60) throw new Error("Bad items");
  const items = o.items.map(i => {
    const qty = Number(i.qty), price = Number(i.price);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new Error("Bad quantity");
    if (!isFinite(price) || price < 0 || price > 10000) throw new Error("Bad price");
    const name = str(i.name, 80);
    if (!name) throw new Error("Bad item");
    return { name: name, qty: qty, price: price, note: str(i.note, 80) };
  });
  return { ref: ref, table: table, name: str(o.name, 40), note: str(o.note, 300), items: items };
}

// Stop guest text from being read as a spreadsheet formula (=, +, -, @ at the start).
function safe(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }
function unsafe(s) { s = String(s == null ? "" : s); return /^'[=+\-@]/.test(s) ? s.slice(1) : s; }

function sheetOf(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- run once: builds the sheets and the staff key ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(ORDERS) || ss.insertSheet(ORDERS, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#2B1D14").setFontColor("#F1E6D2");
  sh.setFrozenRows(1);
  const widths = [150, 110, 60, 110, 320, 50, 80, 70, 80, 220, 100, 150, 60];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.getRange("A2:A").setNumberFormat("dd mmm yyyy, h:mm am/pm");
  sh.getRange("L2:L").setNumberFormat("h:mm am/pm");
  sh.getRange("G2:I").setNumberFormat("₹#,##0");
  sh.getRange("E2:E").setWrap(true);
  sh.getRange("J2:J").setWrap(true);
  sh.getRange("A:M").setVerticalAlignment("top");
  sh.hideColumns(COL.Lines);                 // machine copy of the items, used by the orders board

  const status = sh.getRange("K2:K");
  status.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  const colour = { New: "#F6E3D6", Preparing: "#F3E6C4", Served: "#DCEBD9", Cancelled: "#E4E0DA" };
  sh.setConditionalFormatRules(STATUSES.map(s =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s).setBackground(colour[s]).setRanges([status]).build()));

  const daily = ss.getSheetByName(DAILY) || ss.insertSheet(DAILY);
  daily.clear();
  daily.getRange("A1").setFormula(
    `=QUERY(${ORDERS}!A2:K, "select toDate(A), count(B), sum(F), sum(I) where A is not null and K <> 'Cancelled' ` +
    `group by toDate(A) order by toDate(A) desc label toDate(A) 'Date', count(B) 'Orders', sum(F) 'Items', sum(I) 'Revenue (incl. service)'", 0)`);
  daily.getRange("A1:D1").setFontWeight("bold").setBackground("#2B1D14").setFontColor("#F1E6D2");
  daily.getRange("A2:A").setNumberFormat("ddd dd mmm yyyy");
  daily.getRange("D2:D").setNumberFormat("₹#,##0");
  daily.setColumnWidths(1, 4, 170);
  daily.setFrozenRows(1);

  // Staff key for the orders board: made once, kept in Script Properties, shown in the Settings tab.
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty("STAFF_KEY");
  if (!key) {
    key = Utilities.getUuid().replace(/-/g, "").slice(0, 16).toUpperCase().match(/.{4}/g).join("-");
    props.setProperty("STAFF_KEY", key);
  }
  const st = ss.getSheetByName(SETTINGS) || ss.insertSheet(SETTINGS);
  st.clear();
  st.getRange("A1:B3").setValues([
    ["Staff key", key],
    ["What it's for", "Type this into the orders board the first time you open it on a device. Keep it private."],
    ["New key", "Apps Script → Project Settings → Script properties → delete STAFF_KEY, then run setup again."],
  ]);
  st.getRange("A1:A3").setFontWeight("bold");
  st.getRange("B1").setFontFamily("Roboto Mono").setFontSize(14);
  st.setColumnWidth(1, 120); st.setColumnWidth(2, 520);

  const blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(blank);
  Logger.log("Staff key for the orders board: " + key);
  return sh;
}
