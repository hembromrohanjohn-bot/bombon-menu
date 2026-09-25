/* ============================================================
   BOMBON MENU — every dish, price and diet tag lives here.

   MENU has three tabs: drinks, food, sweets. Each tab is a list of sections:
     { id, es:"Spanish title", en:"English subtitle", note:"small print", ctx:"Kitchen label",
       items:[ ... ], extras:{ title, items:[ ... ] } }
     ctx (optional) is added to short dish names on orders, e.g. "Classic" → "Matcha: Classic"
     extras (optional) is a boxed list under the section, e.g. pasta add-ons
   Item:
     { name:"Avocado Toast", price:550, desc:"tomato jam, …", option:"hot / iced", diet:"veg" }
     name, price, diet are required · desc and option are optional · price null = "ask us"
     diet:
       "veg"    — no meat, fish or egg (dairy & honey are fine)
       "egg"    — contains egg, no meat or fish. Shown under NON-VEG with an EGG tag
       "nonveg" — contains meat, poultry or fish
   SIGNATURES lists the dishes shown by the ★ Signatures button, per tab.
   ============================================================ */
const MENU = {
drinks: [
  { id:"espresso-caliente", es:"Espresso Caliente", en:"Hot espresso", note:"Swap for almond, oat or coconut milk at 100 extra. Beans: Greysoul (medium dark) or Subko (medium).", items:[
    { name:"Espresso", price:190, diet:"veg" },
    { name:"Cappuccino", price:240, diet:"veg" },
    { name:"Cortado", price:220, diet:"veg" },
    { name:"Latte / Flat White", price:250, diet:"veg" },
    { name:"Americano / Long Black", price:210, diet:"veg" },
    { name:"Café Specials", price:350, desc:"mocha / hazelnut / caramel / sea salt caramel", diet:"veg" }
  ]},
  { id:"espresso-frio", es:"Espresso Frío", en:"Iced espresso", note:"Swap for almond, oat or coconut milk at 100 extra.", items:[
    { name:"Iced Cappuccino", price:240, diet:"veg" },
    { name:"Iced Latte", price:250, diet:"veg" },
    { name:"Iced Americano / Iced Long Black", price:210, diet:"veg" },
    { name:"Iced Café Specials", price:350, desc:"mocha / hazelnut / caramel / sea salt caramel", diet:"veg" },
    { name:"Frappuccinos", price:450, desc:"classic / mocha / hazelnut / caramel / sea salt caramel", diet:"veg" },
    { name:"Vanilla Affogato", price:350, desc:"madagascar vanilla, single shot espresso", diet:"veg" },
    { name:"Espresso Tonic", price:260, diet:"veg" }
  ]},
  { id:"cafe-de-filtro", es:"Café de Filtro", en:"Manual brew", note:"Pour-over comes hot or iced. Choose your beans.", items:[
    { name:"French Press", price:350, diet:"veg" },
    { name:"Pour-Over: House (medium dark)", price:300, desc:"red apple, roasted cacao, dark chocolate", option:"hot / iced", diet:"veg" },
    { name:"Pour-Over: Subko (Ratnagiri)", price:350, desc:"marigold, dragon fruit, peach tea", option:"hot / iced", diet:"veg" }
  ]},
  { id:"cold-brew", es:"Barra de Cold Brew", en:"Cold brew bar", ctx:"Cold Brew", items:[
    { name:"The Classic", price:270, diet:"veg" },
    { name:"Spritz", price:300, desc:"gingerale | tonic", diet:"veg" },
    { name:"Barrel Aged", price:400, desc:"whiskey | rum", diet:"veg" },
    { name:"Juices", price:350, desc:"orange | pineapple", diet:"veg" }
  ]},
  { id:"especiales-subko", es:"Especiales Subko", en:"Subko specials", items:[
    { name:"Jaago", price:320, desc:"espresso, jaggery & oat milk", diet:"veg" },
    { name:"Cascara Lemonade", price:350, desc:"hibiscus, tamarind candy, raw honey", diet:"veg" },
    { name:"Cold Fashioned", price:350, desc:"orange zest, black cherry, clove", diet:"veg" }
  ]},
  { id:"bebidas-de-la-casa", es:"Bebidas de la Casa", en:"Signature drinks", items:[
    { name:"Traditional Bombon", price:350, desc:"condensed milk, espresso, milk froth", diet:"veg" },
    { name:"Iced Bombon", price:350, desc:"condensed milk, espresso, milk froth", diet:"veg" },
    { name:"Aerocano", price:300, desc:"it's a secret!", diet:"veg" }
  ]},
  { id:"matcha", es:"Matcha", en:"Japanese green tea", ctx:"Matcha", items:[
    { name:"Classic", price:360, option:"hot / iced", diet:"veg" },
    { name:"Blueberry Matcha", price:450, diet:"veg" },
    { name:"Oratcha", price:480, desc:"fresh orange juice & matcha", diet:"veg" }
  ]},
  { id:"hojicha", es:"Hojicha", en:"Roasted green tea", ctx:"Hojicha", items:[
    { name:"Hoji", price:350, option:"hot / iced", diet:"veg" },
    { name:"Citracha", price:420, desc:"fresh orange juice & hojicha", diet:"veg" },
    { name:"Pinecha", price:380, desc:"fresh pineapple juice & hojicha", diet:"veg" }
  ]},
  { id:"cacao", es:"Cacao", en:"Cocoa", items:[
    { name:"OG Hot Chocolate 54.5%", price:400, diet:"veg" },
    { name:"Subko Hot Chocolate 70%", price:420, diet:"veg" },
    { name:"Spiced Hot Chocolate", price:450, desc:"spiced with cinnamon, cardamom, clove", diet:"veg" },
    { name:"Spiced Iced Chocolate", price:450, desc:"spiced with cinnamon, cardamom, clove", diet:"veg" }
  ]},
  { id:"kombucha", es:"Kombucha", ctx:"Kombucha", items:[
    { name:"Blueberry Rose", price:200, diet:"veg" },
    { name:"Pineapple Spiced", price:200, diet:"veg" },
    { name:"Kairi Spiced", price:200, diet:"veg" },
    { name:"Imli", price:200, diet:"veg" },
    { name:"Jamun", price:200, diet:"veg" }
  ]},
  { id:"batidos", es:"Batidos", en:"Smoothies", items:[
    { name:"PBJ", price:450, desc:"peanut butter, banana, mixed berries", diet:"veg" },
    { name:"Dark Dates", price:490, desc:"SUBKO dark chocolate, espresso, dates, peanut butter", diet:"veg" },
    { name:"Raspberry Pineapple", price:400, desc:"fresh pineapple juice, raspberry, mulberry", diet:"veg" }
  ]},
  { id:"refrescos", es:"Refrescos", en:"Refreshers", ctx:"Refresher", items:[
    { name:"Watermelon", price:200, diet:"veg" },
    { name:"Valencia Orange", price:300, diet:"veg" },
    { name:"Pineapple", price:270, diet:"veg" },
    { name:"ABC", price:290, diet:"veg" },
    { name:"Pineapple Gingerale", price:330, diet:"veg" },
    { name:"Ginger Lemon Honey (hot)", price:250, diet:"veg" }
  ]},
  { id:"tes", es:"Tés", en:"Teas", note:"Tea bags, served in hot water.", ctx:"Tea", items:[
    { name:"Mogo Mogo", price:190, diet:"veg" },
    { name:"Rose Glow", price:190, diet:"veg" },
    { name:"Kashmiri Kahwa", price:210, diet:"veg" },
    { name:"Mint", price:180, diet:"veg" },
    { name:"Kadak Masala", price:180, diet:"veg" }
  ]},
],
food: [
  { id:"de-la-casa", es:"De la Casa", en:"Signatures", items:[
    { name:"Turkish Eggs", price:450, desc:"garlic greek yogurt, 3 poached eggs, chili oil, sourdough slice", diet:"egg" },
    { name:"House Maple Butter Pancakes", price:420, desc:"100% eggless, stack of 3", diet:"veg" },
    { name:"Avocado Toast", price:550, desc:"tomato jam, sliced avocado, arugula, feta, seasoned seeds, lemon dressing", diet:"veg" },
    { name:"Smoked Chicken Caramelized Onion", price:480, diet:"nonveg" },
    { name:"Tamago Sando", price:480, desc:"japanese egg salad, soft-boiled egg, shokupan", diet:"egg" }
  ]},
  { id:"especiales-bombon", es:"Especiales Bombon", en:"Bombon specials", items:[
    { name:"Classic Bennie", price:550, desc:"kielbasa, 2 poached eggs, hollandaise, toasted milk bread", diet:"nonveg" },
    { name:"Bombon Bennie", price:500, desc:"sautéed mushroom & spinach, 2 poached eggs, hollandaise, toasted milk bread", diet:"egg" },
    { name:"Bombon Royale", price:650, desc:"smoked salmon, cream cheese, capers, 2 poached eggs, hollandaise, toasted milk bread", diet:"nonveg" },
    { name:"Full Bombon Breakfast", price:600, desc:"2 fried eggs, artisanal chicken sausages, grilled tomato, herbed roasted potato, roasted mushrooms, baked beans, multigrain toast", diet:"nonveg" }
  ]},
  { id:"frittatas", es:"Frittatas", en:"Spanish-style omelettes", note:"fluffy spanish-style omelettes served with house salad & sourdough (3 eggs preparation)", ctx:"Frittata", items:[
    { name:"Asparagus & Cheddar", price:400, diet:"egg" },
    { name:"Forest Mushroom & Parmesan", price:420, diet:"egg" },
    { name:"Smoked Chicken & Mushroom", price:450, diet:"nonveg" },
    { name:"Ricotta & Spinach", price:420, diet:"egg" }
  ]},
  { id:"huevos", es:"Huevos", en:"Classic eggs", note:"served with house salad & multigrain toast", items:[
    { name:"3 Eggs Your Way", price:380, desc:"scrambled / omelette / poached / fried / boiled", diet:"egg" },
    { name:"Masala Omelette", price:400, diet:"egg" },
    { name:"Masala Cheese Omelette", price:420, diet:"egg" },
    { name:"Chili Cheese Fried Egg", price:450, desc:"crispy fried eggs, base of house made chili oil, mozzarella and scallions", diet:"egg" }
  ]},
  { id:"acompanamientos", es:"Acompañamientos", en:"Sides", ctx:"Side", items:[
    { name:"Artisanal Chicken Sausages (2 pcs)", price:220, diet:"nonveg" },
    { name:"Smoked Salmon", price:250, diet:"nonveg" },
    { name:"Kielbasa", price:200, diet:"nonveg" },
    { name:"Sourdough Slice", price:100, diet:"veg" },
    { name:"Bacon Rashers", price:250, diet:"nonveg" }
  ]},
  { id:"horno", es:"Horno y Bagels", en:"Bakes & bagels", items:[
    { name:"Butter Croissant", price:320, diet:"veg" },
    { name:"Almond Croissant", price:450, diet:"veg" },
    { name:"Chocolate Croissant", price:400, diet:"veg" },
    { name:"Cucumber Cream Cheese Bagel", price:370, diet:"veg" },
    { name:"Jalapeño Scallion Cream Cheese Bagel", price:400, diet:"veg" },
    { name:"Caramelized Onion Cream Cheese Bagel", price:370, diet:"veg" },
    { name:"Salmon Cream Cheese Bagel", price:450, diet:"nonveg" }
  ]},
  { id:"panes", es:"Panes", en:"Breads, toasts & sandos", items:[
    { name:"Truffle & Mushroom Toast", price:500, desc:"hummus, roasted mushrooms, arugula, feta, walnuts, truffle", diet:"veg" },
    { name:"Stracciatella", price:450, desc:"burrata, asparagus, roasted pineapple, chili oil", diet:"veg" },
    { name:"Smoked Salmon Tartine", price:500, desc:"cream cheese, pickled cucumber, dill cream, capers", diet:"nonveg" },
    { name:"Capri", price:400, desc:"herbed focaccia, cherry tomato, pesto, balsamic", diet:"veg" },
    { name:"Falafel Sando", price:450, desc:"smokey hummus, smashed falafel patty, pickled vegetables, lettuce, garlic tahini", diet:"veg" },
    { name:"Tofu Banh Mi", price:500, desc:"marinated tofu, fresh herbs, cucumber, pickled vegetables, sweet-spicy Banh Mi sauce", diet:"veg" },
    { name:"Smashed Veggie Burger", price:450, desc:"tofu patty, sliced tomato, caramelized onion, cheddar", diet:"veg" },
    { name:"Egg & Avocado Croissant", price:570, desc:"sliced avocado, egg salad, cherry tomato", diet:"egg" },
    { name:"Croque Monsieur", price:520, desc:"kielbasa, mustard & cheese", diet:"nonveg" },
    { name:"Smoked Chicken & Caramelised Onion", price:480, diet:"nonveg" },
    { name:"BBQ Chicken Sando", price:520, desc:"shokupan, pulled bbq chicken, purple cabbage slaw, smashed avocado", diet:"nonveg" },
    { name:"Chicken Banh Mi", price:550, desc:"marinated chicken, fresh herbs, cucumber, pickled vegetables, sweet-spicy Banh Mi sauce", diet:"nonveg" },
    { name:"Smashed Chicken Burger", price:480, desc:"grilled chicken patty, sliced tomato, caramelized onion, cheddar", diet:"nonveg" }
  ]},
  { id:"platos", es:"Platos", en:"Plates", items:[
    { name:"The OG Fries", price:300, diet:"veg" },
    { name:"Garlic Chili Fries", price:350, diet:"veg" },
    { name:"Truffle Parmesan Fries", price:400, diet:"veg" },
    { name:"Falafel (4 pcs)", price:350, desc:"garlic tahini sauce, pickled veggies", diet:"veg" },
    { name:"Whipped Ricotta", price:400, desc:"roasted tomato & pesto butter  /  fig jam & roasted walnuts — served with toasted focaccia", diet:"veg" },
    { name:"Chicken Croquettes (4 pcs)", price:380, desc:"marinara sauce, balsamic, parmesan", diet:"nonveg" },
    { name:"Moroccan Chicken Skewers", price:420, desc:"tahina marinated chicken, beetroot raspberry relish, arugula salad", diet:"nonveg" },
    { name:"Roasted Veggies Hummus", price:380, desc:"classic hummus, roasted veggies, sourdough crackers", diet:"veg" }
  ]},
  { id:"cuencos", es:"Cuencos", en:"Bowls", items:[
    { name:"Kale Citrus Salad", price:450, desc:"fresh kale, lemon vinaigrette, roasted nuts, orange, cranberries, parmesan", diet:"veg" },
    { name:"Falafel Bowl", price:550, desc:"4 pcs falafel, classic hummus, roasted veggies, couscous, pickled veggies, garlic tahini", diet:"veg" },
    { name:"Grilled Chicken & Avocado", price:520, desc:"mixed greens, 2 boiled eggs, cranberry, seasoned seeds, walnut, feta", diet:"nonveg" },
    { name:"House Pasta Bowls", price:500, desc:"sauces: marinara | pesto | alfredo | aglio-e-olio  ·  fusilli / spaghetti", diet:"veg" },
    { name:"Charred Broccoli", price:500, desc:"garlic greek yogurt, chili oil, toasted hazelnut, sourdough slice", diet:"veg" }
    ], extras:{ title:"Pasta add-ons", items:[
      { name:"roasted veggies", price:"+150", diet:"veg" },
      { name:"grilled chicken", price:"+150", diet:"nonveg" },
      { name:"bacon rashers", price:"+150", diet:"nonveg" },
      { name:"truffle mushrooms", price:"+150", diet:"veg" },
      { name:"jowar fettuccine (vegan & gluten-free)", price:"+100", diet:"veg" }
    ]} },
],
sweets: [
  { id:"cuencos-de-desayuno", es:"Cuencos de Desayuno", en:"Breakfast bowls", items:[
    { name:"Piña Colada Chia Bowl", price:350, desc:"toasted coconut flakes, hazelnut, roasted pineapple", diet:"veg" },
    { name:"Dark Chocolate Acai Bowl", price:450, desc:"peanut butter, granola, mixed berries", diet:"veg" },
    { name:"Bak'd in Bombon", price:400, desc:"sweetened yogurt, cocoa, caramelised banana, berries", diet:"veg" }
  ]},
  { id:"tortitas", es:"Tortitas y Tostadas Dulces", en:"Pancakes & sweet toasts", items:[
    { name:"Hazelnut & Dark Chocolate Pancakes", price:480, desc:"100% eggless, stack of 3", diet:"veg" },
    { name:"Blueberry Compote & Whipped Cream Pancakes", price:480, desc:"100% eggless, stack of 3", diet:"veg" },
    { name:"Classic French Toast", price:450, desc:"shokupan slice, house custard, vanilla ice cream, cinnamon dust", diet:"egg" },
    { name:"Honey Butter Toast", price:480, desc:"shokupan slice, cream cheese frosting, sea salt caramel", diet:"veg" }
  ]},
  { id:"postres", es:"Postres", en:"Desserts", items:[
    { name:"Skillet Cookie", price:550, desc:"in-house warm cookie, madagascar vanilla", diet:"veg" },
    { name:"Tiramisu", price:450, diet:"egg" }
  ]},
],
};

const SIGNATURES = {
  drinks: ["Traditional Bombon", "Iced Bombon", "Aerocano"],
  food: ["Turkish Eggs", "House Maple Butter Pancakes", "Avocado Toast", "Smoked Chicken Caramelized Onion", "Tamago Sando"],
};
