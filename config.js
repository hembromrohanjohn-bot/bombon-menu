/* ============================================================
   BOMBON — ordering settings
   ============================================================ */
const CONFIG = {
  // Where the menu is published. The table QR codes point here (…?table=10).
  siteUrl: "https://hembromrohanjohn-bot.github.io/bombon-menu/",

  // Tables are numbered 1 … tables. Links with any other table number are ignored.
  // (The Firestore rules also only accept tables 1–40: keep them in step.)
  tables: 40,

  currency: "₹",
  serviceCharge: 0.10,        // 10% — shown as an estimate in the order summary

  // Orders are saved to this Firebase project and appear on the orders board
  // (https://hembromrohanjohn-bot.github.io/bombon-orders/). These values are meant to be public;
  // the Firestore security rules decide who can read and change orders. Set to null to turn ordering off.
  firebase: {
    apiKey: "AIzaSyA_VOzrlvhNsPqf5q5oFOmuMfFMnItxBrI",
    authDomain: "bombon-orders-ucwmp.firebaseapp.com",
    projectId: "bombon-orders-ucwmp",
    storageBucket: "bombon-orders-ucwmp.firebasestorage.app",
    messagingSenderId: "175080005253",
    appId: "1:175080005253:web:e6778bfbb5638053cb93ec",
  },
};
