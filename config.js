/* ============================================================
   BOMBON — ordering settings. Edit these settings.
   ============================================================ */
const CONFIG = {
  // Where the menu is published. The table QR codes point here (…?table=10).
  siteUrl: "https://hembromrohanjohn-bot.github.io/bombon-menu/",

  // Orders backend: the Google Apps Script "Web app URL" (ends in /exec).
  // Empty = guests can browse but not order. Setup: README.md → "Orders backend".
  ordersUrl: "",

  // Tables are numbered 1 … tables. Links with any other table number are ignored.
  tables: 40,

  currency: "₹",
  serviceCharge: 0.10,        // 10% — shown as an estimate in the order summary
};
