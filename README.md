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

    python3 -m http.server 8765

then open http://localhost:8765

## Table ordering (QR codes → WhatsApp)
Each table has a QR code that opens the menu as `…/?table=10`. In that mode every dish gets a **+** button and an order bar
appears at the bottom. The guest reviews the order (quantities, a note per dish, their name) and taps **Send order on WhatsApp**:
WhatsApp opens with the order written out, headed **NEW ORDER · TABLE 10**, addressed to the café number. They press Send
and the order arrives on the café's WhatsApp.

- `config.js` — **set these first**: `siteUrl` (where the menu is published), `whatsapp` (café number, digits with country code,
  e.g. `919876543210`) and `tables` (how many tables)
- `tables.html` — printable QR table cards (A6, four per A4 sheet, dashed cut lines). Shows a warning while `config.js` still has placeholders.
- `order.js` — the basket and WhatsApp message. It only switches on for a valid `?table=` (1 … `tables`); the plain menu and print are unchanged.
- The basket is kept on the guest's phone for 3 hours, so it survives the trip to WhatsApp and back. Each table has its own basket.
- Limits: the guest still has to press Send in WhatsApp, and anyone could edit the table number in the link.
  Orders land in a WhatsApp chat, not a queue — fine for a small café, but consider a kitchen-screen setup if volume grows.

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
