/* ============================================================
   BOMBON — ordering settings. Edit these settings.
   ============================================================ */
const CONFIG = {
  // Where the menu is published. The table QR codes point here (…?table=10).
  siteUrl: "https://example.github.io/bombon-menu/",

  // Café WhatsApp number that receives orders: country code + number,
  // digits only, no "+", spaces or leading zero — e.g. "919876543210".
  whatsapp: "",

  // Google Sheet order log: the Apps Script "Web app URL" (ends in /exec). Leave "" to turn it off.
  // Setup: README.md → "Order log (Google Sheet)".
  ordersUrl: "",

  // Tables are numbered 1 … tables. Links with any other table number are ignored.
  tables: 40,

  currency: "₹",
  serviceCharge: 0.10,        // 10% — shown as an estimate in the order summary
};
