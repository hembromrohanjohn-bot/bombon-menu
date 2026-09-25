# Bombon Menu — web version

Earthy / rustic-modern café menu (warm minimalism, wabi-sabi, vintage European bistro).

## Files
- `index.html` — page shell: header, nav, footer
- `menu-data.js` — **every section, item, description, price and diet tag** (edit this to change the menu)
- `styles.css` — colours (CSS variables at the top), fonts, layout, print styles
- `app.js` — turns the data into the page, highlights the nav, runs the diet filter
- `vendor/qrcode.js` — QR code generator (MIT, Kazuhiko Arase), bundled so `tables.html` works offline

## View it
Double-click `index.html`, or run a local server:

    python3 -m http.server 8000

then open http://localhost:8000

## Table ordering (QR codes)
Live menu: **https://hembromrohanjohn-bot.github.io/bombon-menu/**
Orders board (staff only): **https://hembromrohanjohn-bot.github.io/bombon-orders/** (separate repo `bombon-orders`)

Each of the 40 tables has a QR code that opens the menu as `…/?table=10`. In that mode every dish gets a **+** button and
an order bar appears. The guest reviews the order (quantities, a note per dish, their name) and taps **Place order**.
The order goes straight to the orders backend, the guest sees "Order received", and it pops up on the orders board.

- `config.js` — `siteUrl` (where the menu is published), `ordersUrl` (the orders backend, see below), `tables` (40)
- `tables.html` — printable QR table cards (A6, four per A4 sheet, dashed cut lines). Shows a warning while ordering isn't connected.
- `order.js` — the basket and order sending. It only switches on for a valid `?table=` (1 … `tables`); the plain menu and print are unchanged.
- `google-sheet/Code.gs` — the orders backend (Google Apps Script)
- The basket is kept on the guest's phone for 3 hours, and each table has its own basket.
- If sending fails, the guest keeps their basket and can retry. A retry can't create a duplicate order.

## Orders backend (Google Sheet)
Orders are stored in a Google Sheet you own: time, ref, table, guest, items, quantity, subtotal, service, total, note and
**Status** (New → Preparing → Served / Cancelled). A **Daily totals** tab adds up orders and revenue per day. The orders
board reads and updates this sheet; you can also open the sheet directly at any time.

**One-time setup (about 5 minutes):**
1. Go to [sheets.new](https://sheets.new) and name the sheet, e.g. *Bombon orders*.
2. **Extensions → Apps Script**. Delete what's there, paste all of `google-sheet/Code.gs`, and save.
3. **Project Settings** (gear icon) → **Time zone** → *(GMT+05:30) India Standard Time*.
4. Back in the editor, choose `setup` in the function dropdown → **Run** → allow the permissions it asks for
   (Google shows "unverified app" because it's your own script: *Advanced → Go to … (unsafe)*).
   This creates the *Orders*, *Daily totals* and *Settings* tabs. The **staff key** for the orders board is in *Settings*.
5. **Deploy → New deployment** → type **Web app** → *Execute as*: **Me**, *Who has access*: **Anyone** → **Deploy**.
6. Copy the **Web app URL** (ends in `/exec`) into `ordersUrl` in this repo's `config.js` **and** `apiUrl` in the
   `bombon-orders` repo's `config.js`.

If you change `Code.gs` later: **Deploy → Manage deployments → Edit → Version: New version**, so the URL stays the same.
New staff key: Apps Script → Project Settings → Script properties → delete `STAFF_KEY`, then run `setup` again.

Safeguards: only well-formed orders for tables 1–40 are accepted, totals are recalculated by the script, text is
length-limited and can't run as a formula, a repeated ref is ignored, and one table can't send more than 15 orders in
10 minutes. Reading orders and changing their status needs the staff key. Placing an order doesn't (guests need that),
so someone could still send a fake order, and anyone could edit the table number in the link. Staff should sanity-check
unusual orders.

## Editing items
Each item in `menu-data.js` is an object:

    { name:"Avocado Toast", price:550, desc:"tomato jam, …", diet:"veg" }

- `name`, `price`, `diet` are required; `desc`, `option` (small italic note like "hot / iced") and `addons` are optional
- `price: null` shows no price
- `diet` must be one of:
  - `"veg"` — no meat, fish or egg (dairy and honey are fine)
  - `"egg"` — contains egg, no meat or fish
  - `"nonveg"` — contains meat, poultry or fish (even if it also has egg)
- `addons: [ { name:"grilled chicken", price:"+150", diet:"nonveg" }, … ]` — each add-on has its own diet; under the Veg filter non-veg add-ons are hidden while the dish stays

## Diet filter
The bar under the section nav has **All · Veg · Egg · Non-Veg** with live counts. Veg also offers "include egg dishes".
Empty groups and sections (and their nav links) are hidden automatically.

The choice is remembered in the browser and in the URL, so links / QR codes can open the menu pre-filtered:

- `index.html?diet=veg` — vegetarian
- `index.html?diet=veg&egg=1` — vegetarian + egg dishes
- `index.html?diet=egg` — egg dishes
- `index.html?diet=nonveg` — non-vegetarian

A `?diet=` in the link always wins over what the browser remembered.

## Print / PDF
Open in Chrome → Cmd+P → Save as PDF (A4, margins "None", background graphics on).
Each section prints on its own A4 page with the legend and service-charge note.
Print uses the current filter: e.g. with Veg selected only vegetarian items print, and the cover and every page are labelled "Vegetarian menu".

## Design notes
- Fonts (Google Fonts): Fraunces (titles), Cormorant Garamond small caps (item names, prices), Karla (descriptions), Caveat (handwritten accents)
- Palette: oat paper `#EFE7DA`, espresso ink `#2B1D14`, clay `#A9532F`, olive `#6E6B4A`, ochre `#B98C3E`, bistro burgundy `#4A1F1E`
- Diet marks (Indian standard): green square + dot = veg `#1E8E3E`, ochre square + dot = egg `#C48A1A`, brown square + triangle = non-veg `#8B3A1E`
