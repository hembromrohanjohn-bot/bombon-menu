/* ============================================================
   BOMBON — order log for Google Sheets
   Receives every order sent from the table menu and adds it as a row.

   One-time setup (full steps in README.md → "Order log"):
   1. Create a Google Sheet → Extensions → Apps Script → paste this whole file.
   2. Project Settings (gear) → Time zone: (GMT+05:30) India Standard Time.
   3. Select the `setup` function → Run → allow access. This builds the sheet.
   4. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → Deploy.
   5. Copy the Web app URL (ends in /exec) into `ordersUrl` in config.js.
   ============================================================ */

const TABLES = 40;               // keep in sync with `tables` in config.js
const SERVICE_CHARGE = 0.10;
const ORDERS = "Orders";
const DAILY = "Daily totals";
const HEADERS = ["Received", "Ref", "Table", "Guest", "Items", "Qty", "Subtotal", "Service", "Total", "Note", "Status"];
const STATUSES = ["New", "Preparing", "Served", "Cancelled"];

/* ---------- receive an order ---------- */
function doPost(e) {
  let order;
  try { order = clean(JSON.parse(e.postData.contents)); }
  catch (err) { return reply({ ok: false, error: String(err.message || err) }); }

  const cache = CacheService.getScriptCache();
  if (cache.get("ref:" + order.ref)) return reply({ ok: true, duplicate: true });   // same order sent twice ("Try again")
  const burstKey = "t:" + order.table, burst = Number(cache.get(burstKey) || 0);
  if (burst >= 15) return reply({ ok: false, error: "Too many orders from this table, try again shortly" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ORDERS) || setup();
    const subtotal = order.items.reduce((a, i) => a + i.qty * i.price, 0);
    const service = Math.round(subtotal * SERVICE_CHARGE);
    sheet.appendRow([
      new Date(), order.ref, order.table, safe(order.name),
      order.items.map(i => `${i.qty} × ${i.name}` + (i.note ? ` (${i.note})` : "")).join("\n"),   // starts with a number, so it can't be a formula
      order.items.reduce((a, i) => a + i.qty, 0),
      subtotal, service, subtotal + service, safe(order.note), "New",
    ]);
    cache.put("ref:" + order.ref, "1", 6 * 3600);
    cache.put(burstKey, String(burst + 1), 600);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function doGet() {
  return reply({ ok: true, service: "Bombon order log", tip: "Orders arrive by POST from the menu." });
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

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- run once: builds and styles the sheets ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(ORDERS) || ss.insertSheet(ORDERS, 0);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight("bold").setBackground("#2B1D14").setFontColor("#F1E6D2");
  sh.setFrozenRows(1);
  const widths = [150, 110, 60, 110, 320, 50, 80, 70, 80, 220, 100];
  widths.forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.getRange("A2:A").setNumberFormat("dd mmm yyyy, h:mm am/pm");
  sh.getRange("G2:I").setNumberFormat("₹#,##0");
  sh.getRange("E2:E").setWrap(true);
  sh.getRange("J2:J").setWrap(true);
  sh.getRange("A:K").setVerticalAlignment("top");

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

  const blank = ss.getSheetByName("Sheet1");
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(blank);
  return sh;
}
