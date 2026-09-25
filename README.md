# Bombon Menu — web version

Spanish-themed café menu (Andalusian azulejo tiles, pimentón red, saffron and cobalt), all in English, with
bold type. Laid out like the Dario's digital menu: a centred "book", sticky bar with **Drinks · Food · Sweets**
tabs, **★ Signatures**, a **Veg | Non-veg** switch, search, and section links that follow the scroll.

## Files
- `index.html` — page shell: cover, sticky bar, footer
- `menu-data.js` — **every tab, section, dish, price and diet tag**, plus the Signatures lists (edit this to change the menu)
- `styles.css` — colours and fonts (variables at the top), layout, order bar/sheet, print
- `app.js` — draws the current tab, filters (tab, diet, search, Signatures), section links, remembers choices
- `order.js` — table ordering (see below)
- `vendor/qrcode.js` — QR code generator (MIT, Kazuhiko Arase), bundled so `tables.html` works offline

## Veg / Non-veg
Tap **Veg** or **Non-veg** to filter; tap it again to show everything. Non-veg includes egg dishes, which also
carry an **EGG** tag. Sections with nothing left disappear, and a tab with nothing left (e.g. Drinks under
Non-veg) offers to jump to one that has. Links can open a view directly: `?tab=food&diet=veg`
(`tab` = drinks | food | sweets, `diet` = veg | nonveg). A link's choice wins over what the phone remembered.

## View it
Double-click `index.html`, or run a local server:

    python3 -m http.server 8000

then open http://localhost:8000

## Table ordering (QR codes)
Live menu: **https://hembromrohanjohn-bot.github.io/bombon-menu/**
Orders board (staff only): **https://hembromrohanjohn-bot.github.io/bombon-orders/** (separate repo `bombon-orders`)

Each of the 40 tables has a QR code that opens the menu as `…/?table=10`. In that mode every dish gets a **+ Add** button
and an order bar appears. The guest reviews the order (quantities, a note per dish, their name) and taps **Place order**.
The order is saved to Firebase and pops up on the orders board within a second or two; the guest sees "Thank you!".

- `config.js` — `siteUrl`, `tables` (40), and the public `firebase` settings (set to `null` to switch ordering off)
- `tables.html` — printable QR table cards (A6, four per A4 sheet, dashed cut lines)
- `order.js` — the basket and order sending. It only switches on for a valid `?table=` (1 … `tables`); the plain menu and print are unchanged.
- The basket is kept on the guest's phone for 3 hours, and each table has its own basket.
- If sending fails, the guest keeps their basket and can retry. A retry can't create a duplicate order.

## Orders backend (Firebase)
Firebase project **bombon-orders-ucwmp** (console: https://console.firebase.google.com/project/bombon-orders-ucwmp).
Orders are stored in Firestore (Mumbai, asia-south1) at `restaurants/bombon/orders`.

- Security rules: `firebase/firestore.rules` in the `bombon-orders` repo. Guests can only *create* well-formed orders for
  tables 1–40 (they can't list, change or delete orders). Only the staff login can see orders and change their status.
- Staff sign in to the orders board as username `staff` (Firebase user `staff@bombon.staff`). To add another login, create
  the user under Authentication → Users and add its email to `isStaff()` in the rules.
- Limits: placing an order has to stay open to guests, so someone could still send a fake order, and anyone could edit
  the table number in the link. Staff should sanity-check unusual orders.

## Editing items
`menu-data.js` has three tabs (`drinks`, `food`, `sweets`), each a list of sections:

    { id:"plates", title:"Plates", note:"small print", ctx:"Kitchen label", items:[ … ], extras:{ title, items:[ … ] } }

Each dish is an object:

    { name:"Avocado Toast", price:550, desc:"tomato jam, …", option:"hot / iced", diet:"veg" }

- `name`, `price`, `diet` are required; `desc` and `option` (small italic note) are optional; `price: null` shows "ask us"
- `diet`: `"veg"` (no meat, fish or egg; dairy and honey are fine), `"egg"` (egg, no meat or fish; shown under Non-veg
  with an EGG tag), `"nonveg"` (meat, poultry or fish)
- `ctx` on a section is added to short dish names on orders, e.g. "Classic" → "Matcha: Classic"
- `extras` is a boxed list under a section (the pasta add-ons); each extra has its own `diet`
- `SIGNATURES` at the bottom lists the dishes behind the ★ Signatures button, per tab
- If you rename a dish, guests' saved baskets simply drop it, and nothing breaks.

## Print / PDF
Cmd+P prints all three tabs one after another (the sticky bar and ordering buttons are left out).

## Design notes
- Fonts: cut-paper display capitals in the style of RUINA (Felipe Estay / Rodrigo Typo) for the wordmark, titles,
  labels, dish names and prices. RUINA itself is free only as a personal-use demo, so the site uses the free
  look-alike **Londrina Solid** (Google Fonts, OFL). Lora Medium Italic for descriptions, Montserrat for form fields.
- To use real RUINA after buying its **web** licence (Fontspring / MyFonts): put the web font files in `fonts/` and add
  an `@font-face { font-family: "Ruina"; src: url("fonts/ruina.woff2") format("woff2"); }` rule at the top of
  `styles.css`. The font stacks already list "Ruina" first, so everything switches over automatically.
- Colours: pimentón `#8E2B1F`, saffron `#E8A623`, cobalt `#1F4B99`, olive `#5F6E2C`, crema `#FBF2DF`, ink `#3A1C12`
- Tab accent colours: Drinks cobalt, Food pimentón, Sweets amber

