/* ============================================================
   BOMBON MENU — every dish, price and diet tag lives here.

   MENU has three tabs: drinks, food, sweets. Each tab is a list of sections:
     { id, title:"Section title", note:"small print", ctx:"Kitchen label",
       items:[ ... ], extras:{ title, items:[ ... ] } }
     ctx (optional) is added to short dish names on orders, e.g. "Classic" → "Matcha: Classic"
     extras (optional) is a boxed list under the section, e.g. pasta add-ons
   Item:
     { name:"Avocado Toast", price:550, desc:"tomato jam, …", option:"hot / iced", diet:"veg" }
     name, price, diet are required · desc and option are optional · price null = "ask us"
     image (optional): a photo in images/ (640×640) with a small copy in images/thumbs/ (168px) for the list.
       Ideally a square, top-down shot of the plate. The dish shows a round photo; tapping it opens a large
       dish card (photo, description, price, Add). Photo credits: CREDITS.md.
     diet:
       "veg"    — no meat, fish or egg (dairy & honey are fine)
       "egg"    — contains egg, no meat or fish. Shown under NON-VEG with an EGG tag
       "nonveg" — contains meat, poultry or fish
   SIGNATURES lists the dishes shown by the ★ Signatures button, per tab.
   ============================================================ */
const MENU = {
drinks: [
  { id:"hot-espresso", title:"Hot Espresso", note:"Swap for almond, oat or coconut milk at 100 extra. Beans: Greysoul (medium dark) or Subko (medium).", items:[
    { name:"Espresso", price:190, diet:"veg", image:"images/espresso.jpg" },
    { name:"Cappuccino", price:240, diet:"veg", image:"images/cappuccino.jpg" },
    { name:"Cortado", price:220, diet:"veg", image:"images/cortado.jpg" },
    { name:"Latte / Flat White", price:250, diet:"veg", image:"images/latte-flat-white.jpg" },
    { name:"Americano / Long Black", price:210, diet:"veg", image:"images/americano-long-black.jpg" },
    { name:"Café Specials", price:350, desc:"mocha / hazelnut / caramel / sea salt caramel", diet:"veg", image:"images/cafe-specials.jpg" }
  ]},
  { id:"iced-espresso", title:"Iced Espresso", note:"Swap for almond, oat or coconut milk at 100 extra.", items:[
    { name:"Iced Cappuccino", price:240, diet:"veg", image:"images/iced-cappuccino.jpg" },
    { name:"Iced Latte", price:250, diet:"veg", image:"images/iced-latte.jpg" },
    { name:"Iced Americano / Iced Long Black", price:210, diet:"veg", image:"images/iced-americano-iced-long-black.jpg" },
    { name:"Iced Café Specials", price:350, desc:"mocha / hazelnut / caramel / sea salt caramel", diet:"veg", image:"images/iced-cafe-specials.jpg" },
    { name:"Frappuccinos", price:450, desc:"classic / mocha / hazelnut / caramel / sea salt caramel", diet:"veg", image:"images/frappuccinos.jpg" },
    { name:"Vanilla Affogato", price:350, desc:"madagascar vanilla, single shot espresso", diet:"veg", image:"images/vanilla-affogato.jpg" },
    { name:"Espresso Tonic", price:260, diet:"veg", image:"images/espresso-tonic.jpg" }
  ]},
  { id:"manual-brew", title:"Manual Brew", note:"Pour-over comes hot or iced. Choose your beans.", items:[
    { name:"French Press", price:350, diet:"veg", image:"images/french-press.jpg" },
    { name:"Pour-Over: House (medium dark)", price:300, desc:"red apple, roasted cacao, dark chocolate", option:"hot / iced", diet:"veg", image:"images/pour-over-house-medium-dark.jpg" },
    { name:"Pour-Over: Subko (Ratnagiri)", price:350, desc:"marigold, dragon fruit, peach tea", option:"hot / iced", diet:"veg", image:"images/pour-over-subko-ratnagiri.jpg" }
  ]},
  { id:"cold-brew-bar", title:"Cold Brew Bar", ctx:"Cold Brew", items:[
    { name:"The Classic", price:270, diet:"veg", image:"images/the-classic.jpg" },
    { name:"Spritz", price:300, desc:"gingerale | tonic", diet:"veg", image:"images/spritz.jpg" },
    { name:"Barrel Aged", price:400, desc:"whiskey | rum", diet:"veg", image:"images/barrel-aged.jpg" },
    { name:"Juices", price:350, desc:"orange | pineapple", diet:"veg", image:"images/juices.jpg" }
  ]},
  { id:"subko-specials", title:"Subko Specials", items:[
    { name:"Jaago", price:320, desc:"espresso, jaggery & oat milk", diet:"veg", image:"images/jaago.jpg" },
    { name:"Cascara Lemonade", price:350, desc:"hibiscus, tamarind candy, raw honey", diet:"veg", image:"images/cascara-lemonade.jpg" },
    { name:"Cold Fashioned", price:350, desc:"orange zest, black cherry, clove", diet:"veg", image:"images/cold-fashioned.jpg" }
  ]},
  { id:"signature-drinks", title:"Signature Drinks", items:[
    { name:"Traditional Bombon", price:350, desc:"condensed milk, espresso, milk froth", diet:"veg", image:"images/traditional-bombon.jpg" },
    { name:"Iced Bombon", price:350, desc:"condensed milk, espresso, milk froth", diet:"veg", image:"images/iced-bombon.jpg" },
    { name:"Aerocano", price:300, desc:"it's a secret!", diet:"veg", image:"images/aerocano.jpg" }
  ]},
  { id:"matcha", title:"Matcha", ctx:"Matcha", items:[
    { name:"Classic", price:360, option:"hot / iced", diet:"veg", image:"images/classic.jpg" },
    { name:"Blueberry Matcha", price:450, diet:"veg", image:"images/blueberry-matcha.jpg" },
    { name:"Oratcha", price:480, desc:"fresh orange juice & matcha", diet:"veg", image:"images/oratcha.jpg" }
  ]},
  { id:"hojicha", title:"Hojicha", ctx:"Hojicha", items:[
    { name:"Hoji", price:350, option:"hot / iced", diet:"veg", image:"images/hoji.jpg" },
    { name:"Citracha", price:420, desc:"fresh orange juice & hojicha", diet:"veg", image:"images/citracha.jpg" },
    { name:"Pinecha", price:380, desc:"fresh pineapple juice & hojicha", diet:"veg", image:"images/pinecha.jpg" }
  ]},
  { id:"cocoa", title:"Cocoa", items:[
    { name:"OG Hot Chocolate 54.5%", price:400, diet:"veg", image:"images/og-hot-chocolate-54-5.jpg" },
    { name:"Subko Hot Chocolate 70%", price:420, diet:"veg", image:"images/subko-hot-chocolate-70.jpg" },
    { name:"Spiced Hot Chocolate", price:450, desc:"spiced with cinnamon, cardamom, clove", diet:"veg", image:"images/spiced-hot-chocolate.jpg" },
    { name:"Spiced Iced Chocolate", price:450, desc:"spiced with cinnamon, cardamom, clove", diet:"veg", image:"images/spiced-iced-chocolate.jpg" }
  ]},
  { id:"kombucha", title:"Kombucha", ctx:"Kombucha", items:[
    { name:"Blueberry Rose", price:200, diet:"veg", image:"images/blueberry-rose.jpg" },
    { name:"Pineapple Spiced", price:200, diet:"veg", image:"images/pineapple-spiced.jpg" },
    { name:"Kairi Spiced", price:200, diet:"veg", image:"images/kairi-spiced.jpg" },
    { name:"Imli", price:200, diet:"veg", image:"images/imli.jpg" },
    { name:"Jamun", price:200, diet:"veg", image:"images/jamun.jpg" }
  ]},
  { id:"smoothies", title:"Smoothies", items:[
    { name:"PBJ", price:450, desc:"peanut butter, banana, mixed berries", diet:"veg", image:"images/pbj.jpg" },
    { name:"Dark Dates", price:490, desc:"SUBKO dark chocolate, espresso, dates, peanut butter", diet:"veg", image:"images/dark-dates.jpg" },
    { name:"Raspberry Pineapple", price:400, desc:"fresh pineapple juice, raspberry, mulberry", diet:"veg", image:"images/raspberry-pineapple.jpg" }
  ]},
  { id:"refreshers", title:"Refreshers", ctx:"Refresher", items:[
    { name:"Watermelon", price:200, diet:"veg", image:"images/watermelon.jpg" },
    { name:"Valencia Orange", price:300, diet:"veg", image:"images/valencia-orange.jpg" },
    { name:"Pineapple", price:270, diet:"veg", image:"images/pineapple.jpg" },
    { name:"ABC", price:290, diet:"veg", image:"images/abc.jpg" },
    { name:"Pineapple Gingerale", price:330, diet:"veg", image:"images/pineapple-gingerale.jpg" },
    { name:"Ginger Lemon Honey (hot)", price:250, diet:"veg", image:"images/ginger-lemon-honey-hot.jpg" }
  ]},
  { id:"teas", title:"Teas", note:"Tea bags, served in hot water.", ctx:"Tea", items:[
    { name:"Mogo Mogo", price:190, diet:"veg", image:"images/mogo-mogo.jpg" },
    { name:"Rose Glow", price:190, diet:"veg", image:"images/rose-glow.jpg" },
    { name:"Kashmiri Kahwa", price:210, diet:"veg", image:"images/kashmiri-kahwa.jpg" },
    { name:"Mint", price:180, diet:"veg", image:"images/mint.jpg" },
    { name:"Kadak Masala", price:180, diet:"veg", image:"images/kadak-masala.jpg" }
  ]},
],
food: [
  { id:"signatures", title:"Signatures", items:[
    { name:"Turkish Eggs", price:450, desc:"garlic greek yogurt, 3 poached eggs, chili oil, sourdough slice", diet:"egg", image:"images/turkish-eggs.jpg" },
    { name:"House Maple Butter Pancakes", price:420, desc:"100% eggless, stack of 3", diet:"veg", image:"images/house-maple-butter-pancakes.jpg" },
    { name:"Avocado Toast", price:550, desc:"tomato jam, sliced avocado, arugula, feta, seasoned seeds, lemon dressing", diet:"veg", image:"images/avocado-toast.jpg" },
    { name:"Smoked Chicken Caramelized Onion", price:480, diet:"nonveg", image:"images/smoked-chicken-caramelized-onion.jpg" },
    { name:"Tamago Sando", price:480, desc:"japanese egg salad, soft-boiled egg, shokupan", diet:"egg", image:"images/tamago-sando.jpg" }
  ]},
  { id:"bombon-specials", title:"Bombon Specials", items:[
    { name:"Classic Bennie", price:550, desc:"kielbasa, 2 poached eggs, hollandaise, toasted milk bread", diet:"nonveg", image:"images/classic-bennie.jpg" },
    { name:"Bombon Bennie", price:500, desc:"sautéed mushroom & spinach, 2 poached eggs, hollandaise, toasted milk bread", diet:"egg", image:"images/bombon-bennie.jpg" },
    { name:"Bombon Royale", price:650, desc:"smoked salmon, cream cheese, capers, 2 poached eggs, hollandaise, toasted milk bread", diet:"nonveg", image:"images/bombon-royale.jpg" },
    { name:"Full Bombon Breakfast", price:600, desc:"2 fried eggs, artisanal chicken sausages, grilled tomato, herbed roasted potato, roasted mushrooms, baked beans, multigrain toast", diet:"nonveg", image:"images/full-bombon-breakfast.jpg" }
  ]},
  { id:"frittatas", title:"Frittatas", note:"fluffy spanish-style omelettes served with house salad & sourdough (3 eggs preparation)", ctx:"Frittata", items:[
    { name:"Asparagus & Cheddar", price:400, diet:"egg", image:"images/asparagus-cheddar.jpg" },
    { name:"Forest Mushroom & Parmesan", price:420, diet:"egg", image:"images/forest-mushroom-parmesan.jpg" },
    { name:"Smoked Chicken & Mushroom", price:450, diet:"nonveg", image:"images/smoked-chicken-mushroom.jpg" },
    { name:"Ricotta & Spinach", price:420, diet:"egg", image:"images/ricotta-spinach.jpg" }
  ]},
  { id:"classic-eggs", title:"Classic Eggs", note:"served with house salad & multigrain toast", items:[
    { name:"3 Eggs Your Way", price:380, desc:"scrambled / omelette / poached / fried / boiled", diet:"egg", image:"images/3-eggs-your-way.jpg" },
    { name:"Masala Omelette", price:400, diet:"egg", image:"images/masala-omelette.jpg" },
    { name:"Masala Cheese Omelette", price:420, diet:"egg", image:"images/masala-cheese-omelette.jpg" },
    { name:"Chili Cheese Fried Egg", price:450, desc:"crispy fried eggs, base of house made chili oil, mozzarella and scallions", diet:"egg", image:"images/chili-cheese-fried-egg.jpg" }
  ]},
  { id:"sides", title:"Sides", ctx:"Side", items:[
    { name:"Artisanal Chicken Sausages (2 pcs)", price:220, diet:"nonveg", image:"images/artisanal-chicken-sausages-2-pcs.jpg" },
    { name:"Smoked Salmon", price:250, diet:"nonveg", image:"images/smoked-salmon.jpg" },
    { name:"Kielbasa", price:200, diet:"nonveg", image:"images/kielbasa.jpg" },
    { name:"Sourdough Slice", price:100, diet:"veg", image:"images/sourdough-slice.jpg" },
    { name:"Bacon Rashers", price:250, diet:"nonveg", image:"images/bacon-rashers.jpg" }
  ]},
  { id:"bakes-bagels", title:"Bakes & Bagels", items:[
    { name:"Butter Croissant", price:320, diet:"veg", image:"images/butter-croissant.jpg" },
    { name:"Almond Croissant", price:450, diet:"veg", image:"images/almond-croissant.jpg" },
    { name:"Chocolate Croissant", price:400, diet:"veg", image:"images/chocolate-croissant.jpg" },
    { name:"Cucumber Cream Cheese Bagel", price:370, diet:"veg", image:"images/cucumber-cream-cheese-bagel.jpg" },
    { name:"Jalapeño Scallion Cream Cheese Bagel", price:400, diet:"veg", image:"images/jalapeno-scallion-cream-cheese-bagel.jpg" },
    { name:"Caramelized Onion Cream Cheese Bagel", price:370, diet:"veg", image:"images/caramelized-onion-cream-cheese-bagel.jpg" },
    { name:"Salmon Cream Cheese Bagel", price:450, diet:"nonveg", image:"images/salmon-cream-cheese-bagel.jpg" }
  ]},
  { id:"breads-toasts-sandos", title:"Breads, Toasts & Sandos", items:[
    { name:"Truffle & Mushroom Toast", price:500, desc:"hummus, roasted mushrooms, arugula, feta, walnuts, truffle", diet:"veg", image:"images/truffle-mushroom-toast.jpg" },
    { name:"Stracciatella", price:450, desc:"burrata, asparagus, roasted pineapple, chili oil", diet:"veg", image:"images/stracciatella.jpg" },
    { name:"Smoked Salmon Tartine", price:500, desc:"cream cheese, pickled cucumber, dill cream, capers", diet:"nonveg", image:"images/smoked-salmon-tartine.jpg" },
    { name:"Capri", price:400, desc:"herbed focaccia, cherry tomato, pesto, balsamic", diet:"veg", image:"images/capri.jpg" },
    { name:"Falafel Sando", price:450, desc:"smokey hummus, smashed falafel patty, pickled vegetables, lettuce, garlic tahini", diet:"veg", image:"images/falafel-sando.jpg" },
    { name:"Tofu Banh Mi", price:500, desc:"marinated tofu, fresh herbs, cucumber, pickled vegetables, sweet-spicy Banh Mi sauce", diet:"veg", image:"images/tofu-banh-mi.jpg" },
    { name:"Smashed Veggie Burger", price:450, desc:"tofu patty, sliced tomato, caramelized onion, cheddar", diet:"veg", image:"images/smashed-veggie-burger.jpg" },
    { name:"Egg & Avocado Croissant", price:570, desc:"sliced avocado, egg salad, cherry tomato", diet:"egg", image:"images/egg-avocado-croissant.jpg" },
    { name:"Croque Monsieur", price:520, desc:"kielbasa, mustard & cheese", diet:"nonveg", image:"images/croque-monsieur.jpg" },
    { name:"Smoked Chicken & Caramelised Onion", price:480, diet:"nonveg", image:"images/smoked-chicken-caramelised-onion.jpg" },
    { name:"BBQ Chicken Sando", price:520, desc:"shokupan, pulled bbq chicken, purple cabbage slaw, smashed avocado", diet:"nonveg", image:"images/bbq-chicken-sando.jpg" },
    { name:"Chicken Banh Mi", price:550, desc:"marinated chicken, fresh herbs, cucumber, pickled vegetables, sweet-spicy Banh Mi sauce", diet:"nonveg", image:"images/chicken-banh-mi.jpg" },
    { name:"Smashed Chicken Burger", price:480, desc:"grilled chicken patty, sliced tomato, caramelized onion, cheddar", diet:"nonveg", image:"images/smashed-chicken-burger.jpg" }
  ]},
  { id:"plates", title:"Plates", items:[
    { name:"The OG Fries", price:300, diet:"veg", image:"images/the-og-fries.jpg" },
    { name:"Garlic Chili Fries", price:350, diet:"veg", image:"images/garlic-chili-fries.jpg" },
    { name:"Truffle Parmesan Fries", price:400, diet:"veg", image:"images/truffle-parmesan-fries.jpg" },
    { name:"Falafel (4 pcs)", price:350, desc:"garlic tahini sauce, pickled veggies", diet:"veg", image:"images/falafel-4-pcs.jpg" },
    { name:"Whipped Ricotta", price:400, desc:"roasted tomato & pesto butter  /  fig jam & roasted walnuts — served with toasted focaccia", diet:"veg", image:"images/whipped-ricotta.jpg" },
    { name:"Chicken Croquettes (4 pcs)", price:380, desc:"marinara sauce, balsamic, parmesan", diet:"nonveg", image:"images/chicken-croquettes-4-pcs.jpg" },
    { name:"Moroccan Chicken Skewers", price:420, desc:"tahina marinated chicken, beetroot raspberry relish, arugula salad", diet:"nonveg", image:"images/moroccan-chicken-skewers.jpg" },
    { name:"Roasted Veggies Hummus", price:380, desc:"classic hummus, roasted veggies, sourdough crackers", diet:"veg", image:"images/roasted-veggies-hummus.jpg" }
  ]},
  { id:"bowls", title:"Bowls", items:[
    { name:"Kale Citrus Salad", price:450, desc:"fresh kale, lemon vinaigrette, roasted nuts, orange, cranberries, parmesan", diet:"veg", image:"images/kale-citrus-salad.jpg" },
    { name:"Falafel Bowl", price:550, desc:"4 pcs falafel, classic hummus, roasted veggies, couscous, pickled veggies, garlic tahini", diet:"veg", image:"images/falafel-bowl.jpg" },
    { name:"Grilled Chicken & Avocado", price:520, desc:"mixed greens, 2 boiled eggs, cranberry, seasoned seeds, walnut, feta", diet:"nonveg", image:"images/grilled-chicken-avocado.jpg" },
    { name:"House Pasta Bowls", price:500, desc:"sauces: marinara | pesto | alfredo | aglio-e-olio  ·  fusilli / spaghetti", diet:"veg", image:"images/house-pasta-bowls.jpg" },
    { name:"Charred Broccoli", price:500, desc:"garlic greek yogurt, chili oil, toasted hazelnut, sourdough slice", diet:"veg", image:"images/charred-broccoli.jpg" }
    ], extras:{ title:"Pasta add-ons", items:[
      { name:"roasted veggies", price:"+150", diet:"veg" },
      { name:"grilled chicken", price:"+150", diet:"nonveg" },
      { name:"bacon rashers", price:"+150", diet:"nonveg" },
      { name:"truffle mushrooms", price:"+150", diet:"veg" },
      { name:"jowar fettuccine (vegan & gluten-free)", price:"+100", diet:"veg" }
    ]} },
],
sweets: [
  { id:"breakfast-bowls", title:"Breakfast Bowls", items:[
    { name:"Piña Colada Chia Bowl", price:350, desc:"toasted coconut flakes, hazelnut, roasted pineapple", diet:"veg", image:"images/pina-colada-chia-bowl.jpg" },
    { name:"Dark Chocolate Acai Bowl", price:450, desc:"peanut butter, granola, mixed berries", diet:"veg", image:"images/dark-chocolate-acai-bowl.jpg" },
    { name:"Bak'd in Bombon", price:400, desc:"sweetened yogurt, cocoa, caramelised banana, berries", diet:"veg", image:"images/bak-d-in-bombon.jpg" }
  ]},
  { id:"pancakes-sweet-toasts", title:"Pancakes & Sweet Toasts", items:[
    { name:"Hazelnut & Dark Chocolate Pancakes", price:480, desc:"100% eggless, stack of 3", diet:"veg", image:"images/hazelnut-dark-chocolate-pancakes.jpg" },
    { name:"Blueberry Compote & Whipped Cream Pancakes", price:480, desc:"100% eggless, stack of 3", diet:"veg", image:"images/blueberry-compote-whipped-cream-pancakes.jpg" },
    { name:"Classic French Toast", price:450, desc:"shokupan slice, house custard, vanilla ice cream, cinnamon dust", diet:"egg", image:"images/classic-french-toast.jpg" },
    { name:"Honey Butter Toast", price:480, desc:"shokupan slice, cream cheese frosting, sea salt caramel", diet:"veg", image:"images/honey-butter-toast.jpg" }
  ]},
  { id:"desserts", title:"Desserts", items:[
    { name:"Skillet Cookie", price:550, desc:"in-house warm cookie, madagascar vanilla", diet:"veg", image:"images/skillet-cookie.jpg" },
    { name:"Tiramisu", price:450, diet:"egg", image:"images/tiramisu.jpg" }
  ]},
],
};

const SIGNATURES = {
  drinks: ["Traditional Bombon", "Iced Bombon", "Aerocano"],
  food: ["Turkish Eggs", "House Maple Butter Pancakes", "Avocado Toast", "Smoked Chicken Caramelized Onion", "Tamago Sando"],
};
