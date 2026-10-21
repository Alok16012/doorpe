/* Seed catalogue for the local driver. All names and brands are invented for the demo.
 * Variant tuple: [unit label, MRP in ₹, selling price in ₹, stock?]  (stock defaults to 40) */
export type VariantDef = [string, number, number, number?];
export type ProductDef = { n: string; b: string; e: string; v: VariantDef[]; t?: string; info?: Record<string, string> };
export type SubDef = { slug: string; name: string; icon: string; products: ProductDef[] };
export type CategoryDef = { slug: string; name: string; icon: string; tint: string; subs: SubDef[] };
export type GroupDef = { slug: string; name: string; categories: CategoryDef[] };

const p = (n: string, b: string, e: string, v: VariantDef[], t = "", info?: Record<string, string>): ProductDef => ({ n, b, e, v, t, info });

export const GROUPS: GroupDef[] = [
  {
    slug: "groceries",
    name: "Groceries & Staples",
    categories: [
      {
        slug: "fruits-vegetables", name: "Fruits & Vegetables", icon: "🥦", tint: "#e6f4ea",
        subs: [
          { slug: "fresh-vegetables", name: "Fresh Vegetables", icon: "🥕", products: [
            p("Red Onion (Pyaz)", "Turant Fresh", "🧅", [["1 kg", 79, 61], ["2 x 1 kg", 158, 119]], "onion pyaz sabzi", { "Shelf life": "10 days", "Storage": "Cool, dry place" }),
            p("Potato (Aloo)", "Turant Fresh", "🥔", [["1 kg", 32, 27], ["2 kg", 64, 52]], "potato aloo"),
            p("Hybrid Tomato (Tamatar)", "Turant Fresh", "🍅", [["500 g", 30, 24]], "tomato tamatar"),
            p("Orange Carrot (Gajar)", "Turant Fresh", "🥕", [["500 g", 48, 39]], "carrot gajar"),
            p("Green Chilli (Hari Mirch)", "Turant Fresh", "🌶️", [["100 g", 25, 19]], "chilli mirch"),
            p("Ginger (Adrak)", "Turant Fresh", "🫚", [["200 g", 44, 36]], "ginger adrak"),
            p("Garlic (Lehsun)", "Turant Fresh", "🧄", [["200 g", 99, 84]], "garlic lehsun"),
            p("Cucumber (Kheera)", "Turant Fresh", "🥒", [["500 g", 45, 38]], "cucumber kheera"),
            p("Capsicum (Shimla Mirch)", "Turant Fresh", "🫑", [["250 g", 45, 37]], "capsicum shimla"),
            p("Broccoli", "Green Basket", "🥦", [["1 pc (300-350 g)", 99, 79, 0]], "broccoli exotic"),
            p("Sweet Corn Cob", "Turant Fresh", "🌽", [["2 pcs", 60, 48]], "corn bhutta"),
            p("Brinjal Bharta (Baingan)", "Turant Fresh", "🍆", [["500 g", 34, 27]], "brinjal baingan"),
          ]},
          { slug: "fresh-fruits", name: "Fresh Fruits", icon: "🍎", products: [
            p("Banana Robusta", "Turant Fresh", "🍌", [["6 pcs", 59, 48], ["12 pcs", 118, 92]], "banana kela"),
            p("Shimla Apple", "Orchard Co", "🍎", [["500 g", 152, 129], ["1 kg", 299, 245]], "apple seb"),
            p("Nagpur Orange", "Orchard Co", "🍊", [["1 kg", 140, 112]], "orange santra"),
            p("Green Grapes", "Orchard Co", "🍇", [["500 g", 125, 99]], "grapes angoor"),
            p("Pomegranate", "Orchard Co", "🍎", [["2 pcs", 190, 158]], "anar pomegranate"),
            p("Watermelon (Kiran)", "Turant Fresh", "🍉", [["1 pc (2-2.5 kg)", 89, 72]], "watermelon tarbooz"),
            p("Lemon", "Turant Fresh", "🍋", [["250 g", 67, 55]], "lemon nimbu"),
            p("Pineapple", "Orchard Co", "🍍", [["1 pc", 110, 89]], "pineapple ananas"),
          ]},
          { slug: "leafy-herbs", name: "Leafy & Herbs", icon: "🌿", products: [
            p("Coriander Bunch (Dhaniya)", "Turant Fresh", "🌿", [["100 g", 21, 17]], "coriander dhaniya"),
            p("Mint Leaves (Pudina)", "Turant Fresh", "🌱", [["100 g", 25, 20]], "mint pudina"),
            p("Spinach (Palak)", "Turant Fresh", "🥬", [["250 g", 30, 24]], "spinach palak"),
            p("Curry Leaves (Kadi Patta)", "Turant Fresh", "🍃", [["50 g", 15, 12]], "curry leaves"),
          ]},
          { slug: "exotic", name: "Exotics", icon: "🥑", products: [
            p("Hass Avocado", "Green Basket", "🥑", [["1 pc (150-200 g)", 149, 119]], "avocado exotic"),
            p("Kiwi", "Green Basket", "🥝", [["3 pcs", 120, 99]], "kiwi exotic"),
            p("Cherry Tomato", "Green Basket", "🍅", [["200 g", 80, 64]], "cherry tomato"),
            p("Button Mushroom", "Green Basket", "🍄", [["200 g", 60, 49]], "mushroom"),
          ]},
        ],
      },
      {
        slug: "dairy-bread-eggs", name: "Dairy, Bread & Eggs", icon: "🥛", tint: "#eaf1fb",
        subs: [
          { slug: "milk", name: "Milk", icon: "🥛", products: [
            p("Full Cream Milk", "Desi Dairy", "🥛", [["500 ml", 35, 35], ["1 L", 69, 69]], "milk doodh"),
            p("Toned Milk", "Desi Dairy", "🥛", [["500 ml", 29, 29], ["1 L", 57, 57]], "milk toned"),
            p("A2 Cow Milk", "Gaushala Farms", "🐄", [["1 L", 95, 89]], "milk cow a2"),
            p("Lactose Free Milk", "Desi Dairy", "🥛", [["250 ml", 28, 28]], "milk lactose"),
          ]},
          { slug: "curd-yogurt", name: "Curd & Yogurt", icon: "🥣", products: [
            p("Fresh Dahi", "Desi Dairy", "🥣", [["400 g", 40, 40], ["1 kg", 95, 90]], "curd dahi"),
            p("Greek Yogurt Blueberry", "Hilltop Creamery", "🫐", [["100 g", 60, 54]], "yogurt greek protein"),
            p("Mishti Doi", "Bengal Sweets Co", "🍮", [["100 g", 25, 25]], "mishti doi"),
            p("Masala Chaas", "Desi Dairy", "🥤", [["200 ml", 15, 15]], "buttermilk chaas"),
          ]},
          { slug: "butter-cheese", name: "Butter & Cheese", icon: "🧈", products: [
            p("Salted Butter", "Desi Dairy", "🧈", [["100 g", 62, 58], ["500 g", 285, 270]], "butter makhan"),
            p("Cheese Slices", "Hilltop Creamery", "🧀", [["200 g (10 slices)", 160, 142]], "cheese slice"),
            p("Mozzarella Block", "Hilltop Creamery", "🧀", [["200 g", 190, 165]], "cheese mozzarella pizza"),
          ]},
          { slug: "paneer-tofu", name: "Paneer & Tofu", icon: "🧊", products: [
            p("Malai Paneer", "Desi Dairy", "🧊", [["200 g", 95, 88]], "paneer cottage cheese"),
            p("High Protein Paneer", "Hilltop Creamery", "🧊", [["200 g", 165, 99]], "paneer protein"),
            p("Firm Tofu", "Soya Simple", "🥡", [["200 g", 110, 95]], "tofu vegan"),
          ]},
          { slug: "bread-buns", name: "Bread & Buns", icon: "🍞", products: [
            p("Whole Wheat Bread", "Daily Bake", "🍞", [["400 g", 55, 50]], "bread atta brown"),
            p("Sandwich White Bread", "Daily Bake", "🍞", [["350 g", 45, 42]], "bread white"),
            p("Pav Buns", "Daily Bake", "🥯", [["6 pcs", 35, 32]], "pav bun"),
            p("Multigrain Bread", "Daily Bake", "🍞", [["400 g", 65, 58, 0]], "bread multigrain"),
          ]},
          { slug: "eggs", name: "Eggs", icon: "🥚", products: [
            p("Farm White Eggs", "Henhouse", "🥚", [["6 pcs", 66, 54], ["12 pcs", 132, 99], ["30 pcs", 300, 225]], "eggs anda"),
            p("Brown Eggs", "Henhouse", "🥚", [["6 pcs", 90, 78]], "eggs brown"),
          ]},
        ],
      },
      {
        slug: "atta-rice-dal", name: "Atta, Rice & Dal", icon: "🌾", tint: "#fbf3e4",
        subs: [
          { slug: "atta-flours", name: "Atta & Flours", icon: "🌾", products: [
            p("Whole Wheat Chakki Atta", "Annapoorna Mills", "🌾", [["5 kg", 310, 262], ["10 kg", 590, 495]], "atta wheat flour"),
            p("Besan (Gram Flour)", "Annapoorna Mills", "🌾", [["500 g", 75, 62]], "besan gram flour"),
            p("Maida", "Annapoorna Mills", "🌾", [["500 g", 50, 38]], "maida flour"),
          ]},
          { slug: "rice", name: "Rice", icon: "🍚", products: [
            p("Basmati Rice Classic", "Royal Grain", "🍚", [["1 kg", 180, 139], ["5 kg", 850, 649]], "rice basmati chawal"),
            p("Sona Masoori Rice", "Royal Grain", "🍚", [["5 kg", 420, 355]], "rice sona masoori"),
            p("Poha (Thick)", "Royal Grain", "🍚", [["500 g", 60, 49]], "poha flattened rice"),
          ]},
          { slug: "dals-pulses", name: "Dals & Pulses", icon: "🫘", products: [
            p("Toor Dal (Arhar)", "Annapoorna Mills", "🫘", [["1 kg", 210, 172]], "toor arhar dal"),
            p("Moong Dal (Yellow)", "Annapoorna Mills", "🫘", [["1 kg", 180, 149]], "moong dal"),
            p("Kabuli Chana", "Annapoorna Mills", "🫘", [["500 g", 99, 82]], "chana chickpea chole"),
            p("Rajma (Red Kidney Beans)", "Annapoorna Mills", "🫘", [["500 g", 110, 94]], "rajma kidney beans"),
          ]},
        ],
      },
      {
        slug: "oil-ghee-masala", name: "Oils, Ghee & Masala", icon: "🫙", tint: "#fdf0e3",
        subs: [
          { slug: "cooking-oil", name: "Cooking Oil", icon: "🛢️", products: [
            p("Refined Sunflower Oil", "Golden Drop", "🛢️", [["1 L", 165, 139], ["5 L", 820, 679]], "oil sunflower"),
            p("Kachi Ghani Mustard Oil", "Golden Drop", "🛢️", [["1 L", 190, 162]], "mustard oil sarson"),
          ]},
          { slug: "ghee", name: "Ghee", icon: "🫙", products: [
            p("Pure Cow Ghee", "Desi Dairy", "🫙", [["500 ml", 340, 315], ["1 L", 670, 615]], "ghee"),
          ]},
          { slug: "spices", name: "Spices & Masala", icon: "🌶️", products: [
            p("Turmeric Powder (Haldi)", "Masala Mandi", "🫙", [["100 g", 43, 32]], "haldi turmeric"),
            p("Red Chilli Powder", "Masala Mandi", "🌶️", [["100 g", 55, 44]], "chilli powder lal mirch"),
            p("Cumin Seeds (Jeera)", "Masala Mandi", "🧂", [["100 g", 125, 48]], "jeera cumin"),
            p("Garam Masala", "Masala Mandi", "🧂", [["100 g", 90, 76]], "garam masala"),
            p("Green Cardamom (Elaichi)", "Masala Mandi", "🫛", [["20 g", 250, 181]], "elaichi cardamom"),
          ]},
          { slug: "salt-sugar", name: "Salt & Sugar", icon: "🧂", products: [
            p("Iodised Salt", "Pure Pinch", "🧂", [["1 kg", 28, 27]], "salt namak"),
            p("Refined Sugar", "Pure Pinch", "🍬", [["1 kg", 95, 62], ["5 kg", 490, 329]], "sugar cheeni"),
            p("Pink Rock Salt", "Pure Pinch", "🧂", [["500 g", 80, 59]], "rock salt sendha"),
          ]},
        ],
      },
      {
        slug: "dry-fruits-cereals", name: "Dry Fruits & Breakfast", icon: "🥜", tint: "#f6efe6",
        subs: [
          { slug: "dry-fruits", name: "Dry Fruits & Nuts", icon: "🥜", products: [
            p("California Almonds", "Nutty Tales", "🌰", [["250 g", 380, 289]], "almond badam"),
            p("Cashew W320", "Nutty Tales", "🥜", [["250 g", 420, 319]], "cashew kaju"),
            p("Roasted Makhana", "Nutty Tales", "🍿", [["100 g", 210, 99]], "makhana fox nut"),
            p("Raw Peanuts", "Nutty Tales", "🥜", [["500 g", 120, 79]], "peanut moongphali"),
          ]},
          { slug: "cereals-oats", name: "Cereals & Oats", icon: "🥣", products: [
            p("Rolled Oats", "Morning Bowl", "🥣", [["1 kg", 199, 165]], "oats"),
            p("Corn Flakes Original", "Morning Bowl", "🥣", [["475 g", 210, 182]], "cornflakes cereal"),
            p("Crunchy Muesli Fruit & Nut", "Morning Bowl", "🥣", [["500 g", 399, 319]], "muesli"),
            p("Peanut Butter Crunchy", "Nutty Tales", "🥜", [["350 g", 249, 199]], "peanut butter spread"),
          ]},
        ],
      },
      {
        slug: "biscuits-bakery", name: "Bakery & Biscuits", icon: "🍪", tint: "#f8eedf",
        subs: [
          { slug: "biscuits", name: "Biscuits & Cookies", icon: "🍪", products: [
            p("Choco Chip Cookies", "Daily Bake", "🍪", [["200 g", 60, 42]], "cookies"),
            p("Cream Bourbon Biscuits", "Daily Bake", "🍫", [["150 g", 30, 25]], "bourbon biscuit"),
            p("Marie Tea Biscuits", "Daily Bake", "🍘", [["250 g", 40, 35]], "marie biscuit"),
            p("Digestive Oats Biscuits", "Daily Bake", "🍪", [["250 g", 75, 65]], "digestive"),
          ]},
          { slug: "cakes-rusks", name: "Cakes & Rusks", icon: "🍰", products: [
            p("Chocolate Muffin Pack", "Daily Bake", "🧁", [["4 pcs", 120, 99]], "muffin cake"),
            p("Elaichi Rusk", "Daily Bake", "🥖", [["300 g", 70, 59]], "rusk toast"),
          ]},
        ],
      },
      {
        slug: "meat-fish", name: "Chicken, Meat & Fish", icon: "🍗", tint: "#fbeaea",
        subs: [
          { slug: "chicken", name: "Chicken", icon: "🍗", products: [
            p("Chicken Curry Cut (Skinless)", "Fresh Cuts", "🍗", [["500 g", 199, 169]], "chicken curry cut"),
            p("Boneless Chicken Breast", "Fresh Cuts", "🍗", [["450 g", 299, 259]], "chicken breast boneless"),
          ]},
          { slug: "mutton", name: "Mutton", icon: "🥩", products: [
            p("Goat Curry Cut", "Fresh Cuts", "🥩", [["500 g", 499, 449]], "mutton goat"),
          ]},
          { slug: "fish-seafood", name: "Fish & Seafood", icon: "🐟", products: [
            p("Rohu Fish Curry Cut", "Fresh Cuts", "🐟", [["500 g", 260, 219]], "fish rohu"),
            p("Prawns (Medium, Cleaned)", "Fresh Cuts", "🦐", [["250 g", 320, 279, 0]], "prawns jhinga"),
          ]},
        ],
      },
      {
        slug: "kitchen-appliances", name: "Kitchen & Appliances", icon: "🍳", tint: "#eef0f4",
        subs: [
          { slug: "cookware", name: "Cookware", icon: "🍳", products: [
            p("Non-stick Tawa 28 cm", "Kitchen Kraft", "🍳", [["1 pc", 1290, 699]], "tawa pan"),
            p("Steel Pressure Cooker 3 L", "Kitchen Kraft", "🍲", [["1 pc", 2100, 1449]], "cooker"),
            p("Vegetable Chopper", "Kitchen Kraft", "🔪", [["1 pc", 599, 299]], "chopper"),
          ]},
          { slug: "appliances", name: "Small Appliances", icon: "🔌", products: [
            p("Electric Kettle 1.5 L", "HomeVolt", "🫖", [["1 pc", 1499, 749]], "kettle"),
            p("Mixer Grinder 500 W", "HomeVolt", "🌀", [["1 pc", 3999, 2299]], "mixer grinder"),
          ]},
        ],
      },
    ],
  },
  {
    slug: "snacks-drinks",
    name: "Snacks & Beverages",
    categories: [
      {
        slug: "chips-namkeen", name: "Chips & Namkeen", icon: "🍟", tint: "#fff3d6",
        subs: [
          { slug: "chips", name: "Chips & Crisps", icon: "🍟", products: [
            p("Classic Salted Potato Chips", "Crunchy Co", "🥔", [["52 g", 20, 20], ["90 g", 50, 34]], "chips wafers salted"),
            p("Peri Peri Banana Chips", "Kerala Crisp", "🍌", [["75 g", 50, 36]], "banana chips"),
            p("Masala Magic Potato Chips", "Crunchy Co", "🌶️", [["80 g", 48, 39]], "chips masala"),
            p("Korean Chilli Corn Puffs", "Puff Lab", "🌽", [["66 g", 50, 44]], "puffs korean"),
            p("Tortilla Nachos Cheese", "Puff Lab", "🧀", [["150 g", 99, 79]], "nachos"),
          ]},
          { slug: "namkeen", name: "Namkeen & Bhujia", icon: "🥨", products: [
            p("Aloo Bhujia", "Mithai Ghar", "🥨", [["400 g", 110, 96]], "bhujia namkeen"),
            p("Khatta Meetha Mixture", "Mithai Ghar", "🥨", [["200 g", 55, 49]], "namkeen mixture"),
            p("Roasted Chana Jor", "Mithai Ghar", "🫘", [["150 g", 45, 39]], "chana"),
          ]},
          { slug: "popcorn", name: "Popcorn & Popped", icon: "🍿", products: [
            p("Butter Popcorn (Microwave)", "Puff Lab", "🍿", [["90 g", 60, 49]], "popcorn"),
            p("Pudina Rice Popped Chips", "Puff Lab", "🍘", [["54 g", 40, 32]], "popped chips"),
          ]},
        ],
      },
      {
        slug: "sweets-chocolates", name: "Sweets & Chocolates", icon: "🍫", tint: "#f3e9e4",
        subs: [
          { slug: "chocolates", name: "Chocolates", icon: "🍫", products: [
            p("Silky Milk Chocolate Bar", "Cocoa Bay", "🍫", [["60 g", 100, 95], ["150 g", 230, 210]], "chocolate"),
            p("Dark Chocolate 70%", "Cocoa Bay", "🍫", [["80 g", 199, 169]], "dark chocolate"),
            p("Choco Wafer Rolls", "Cocoa Bay", "🥖", [["125 g", 100, 71]], "wafer roll"),
            p("Gems Candy Pack", "Cocoa Bay", "🍬", [["5 x 17.8 g", 100, 90]], "candy gems"),
          ]},
          { slug: "indian-sweets", name: "Indian Sweets", icon: "🍮", products: [
            p("Gulab Jamun Tin", "Mithai Ghar", "🍡", [["1 kg", 299, 239]], "gulab jamun"),
            p("Rasgulla Tin", "Bengal Sweets Co", "🍮", [["1 kg", 280, 225]], "rasgulla"),
            p("Kaju Katli", "Mithai Ghar", "🍬", [["250 g", 349, 299]], "kaju katli barfi"),
          ]},
        ],
      },
      {
        slug: "drinks-juices", name: "Drinks & Juices", icon: "🥤", tint: "#e7f2fb",
        subs: [
          { slug: "soft-drinks", name: "Soft Drinks", icon: "🥤", products: [
            p("Cola Fizz", "Bubbly", "🥤", [["750 ml", 45, 40], ["2.25 L", 110, 99]], "cola soft drink"),
            p("Lemon Soda", "Bubbly", "🍋", [["600 ml", 40, 38]], "soda lemon"),
            p("Diet Cola Cans", "Bubbly", "🥫", [["6 x 300 ml", 270, 229]], "diet cola cans"),
            p("Energy Drink", "Volt Up", "⚡", [["250 ml", 125, 115]], "energy drink"),
          ]},
          { slug: "juices", name: "Juices", icon: "🧃", products: [
            p("Mixed Fruit Juice", "Squeeze", "🧃", [["1 L", 150, 76]], "juice mixed fruit"),
            p("Tender Coconut Water", "Squeeze", "🥥", [["1 L", 178, 99]], "coconut water nariyal"),
            p("Mango Drink", "Squeeze", "🥭", [["1.2 L", 80, 72]], "mango drink"),
          ]},
          { slug: "water-ice", name: "Water & Ice", icon: "🧊", products: [
            p("Packaged Drinking Water", "Clearspring", "💧", [["1 L", 20, 20], ["5 L", 80, 72]], "water bisleri"),
            p("Ice Cubes", "Clearspring", "🧊", [["1 kg", 50, 45]], "ice"),
          ]},
        ],
      },
      {
        slug: "tea-coffee", name: "Tea, Coffee & More", icon: "🍵", tint: "#f2ece3",
        subs: [
          { slug: "tea", name: "Tea", icon: "🍵", products: [
            p("Assam Strong Tea", "Chai Bagan", "🍵", [["500 g", 290, 245], ["1 kg", 560, 465]], "tea chai"),
            p("Green Tea Bags", "Chai Bagan", "🍃", [["25 bags", 175, 139]], "green tea"),
            p("Masala Chai Premix", "Chai Bagan", "☕", [["10 sachets", 110, 95]], "chai premix"),
          ]},
          { slug: "coffee", name: "Coffee", icon: "☕", products: [
            p("Instant Coffee Classic", "Brew House", "☕", [["100 g", 345, 299]], "coffee instant"),
            p("Filter Coffee Powder", "Brew House", "☕", [["200 g", 220, 189]], "filter coffee"),
            p("Cold Coffee Can", "Brew House", "🥫", [["180 ml", 60, 55]], "cold coffee"),
          ]},
          { slug: "health-drinks", name: "Health Drinks", icon: "💪", products: [
            p("Chocolate Malt Drink Jar", "Vita Grow", "🫙", [["500 g", 260, 238]], "malt health drink"),
            p("Whey Protein Chocolate", "Vita Grow", "💪", [["500 g", 1899, 1399]], "protein whey"),
          ]},
        ],
      },
      {
        slug: "instant-food", name: "Instant & Frozen", icon: "🍜", tint: "#fbefe1",
        subs: [
          { slug: "noodles", name: "Noodles & Pasta", icon: "🍜", products: [
            p("Masala Instant Noodles", "Quick Bowl", "🍜", [["4 x 70 g", 64, 60], ["12 x 70 g", 192, 172]], "noodles maggi"),
            p("Penne Pasta", "Quick Bowl", "🍝", [["500 g", 120, 99]], "pasta penne"),
            p("Korean Spicy Ramen", "Quick Bowl", "🔥", [["120 g", 110, 95]], "ramen korean"),
          ]},
          { slug: "ready-to-eat", name: "Ready to Eat", icon: "🍛", products: [
            p("Dal Makhani (Heat & Eat)", "Ghar Ka Khana", "🍛", [["300 g", 140, 119]], "dal makhani ready"),
            p("Rajma Chawal Bowl", "Ghar Ka Khana", "🍛", [["350 g", 160, 139]], "rajma chawal"),
            p("Poha Instant Cup", "Ghar Ka Khana", "🥣", [["80 g", 50, 45]], "poha instant"),
          ]},
          { slug: "frozen", name: "Frozen Snacks", icon: "❄️", products: [
            p("Veg Momos", "Frost Bite", "🥟", [["24 pcs", 199, 165]], "momos frozen"),
            p("Aloo Tikki", "Frost Bite", "🥔", [["400 g", 150, 129]], "aloo tikki frozen"),
            p("French Fries", "Frost Bite", "🍟", [["420 g", 150, 119]], "fries frozen"),
            p("Green Peas (Frozen)", "Frost Bite", "🫛", [["500 g", 113, 87]], "matar peas frozen"),
          ]},
        ],
      },
      {
        slug: "sauces-spreads", name: "Sauces & Spreads", icon: "🍯", tint: "#fde9e3",
        subs: [
          { slug: "sauces", name: "Ketchup & Sauces", icon: "🥫", products: [
            p("Tomato Ketchup", "Saucy", "🥫", [["950 g", 160, 129]], "ketchup sauce"),
            p("Schezwan Chutney", "Saucy", "🌶️", [["250 g", 99, 85]], "schezwan"),
            p("Eggless Mayonnaise", "Saucy", "🫙", [["250 g", 99, 89]], "mayo mayonnaise"),
          ]},
          { slug: "spreads-jams", name: "Jams, Honey & Spreads", icon: "🍯", products: [
            p("Mixed Fruit Jam", "Orchard Co", "🍓", [["500 g", 199, 169]], "jam"),
            p("Pure Honey", "Hive & Co", "🍯", [["500 g", 299, 239]], "honey shahad"),
            p("Hazelnut Cocoa Spread", "Cocoa Bay", "🫙", [["350 g", 399, 349]], "chocolate spread"),
          ]},
        ],
      },
      {
        slug: "ice-creams", name: "Ice Creams & Desserts", icon: "🍦", tint: "#f5e9f7",
        subs: [
          { slug: "tubs", name: "Tubs & Cups", icon: "🍨", products: [
            p("Vanilla Ice Cream Tub", "Frosty Farm", "🍨", [["700 ml", 200, 180]], "ice cream vanilla"),
            p("Belgian Chocolate Tub", "Frosty Farm", "🍫", [["500 ml", 320, 289]], "ice cream chocolate"),
            p("Frozen Yogurt Honey", "Frosty Farm", "🍯", [["115 ml", 185, 185]], "froyo"),
          ]},
          { slug: "sticks-cones", name: "Sticks & Cones", icon: "🍦", products: [
            p("Choco Cone", "Frosty Farm", "🍦", [["120 ml", 50, 50]], "cone"),
            p("Mango Kulfi Stick", "Frosty Farm", "🥭", [["60 ml", 40, 40]], "kulfi"),
          ]},
        ],
      },
    ],
  },
  {
    slug: "beauty-wellness",
    name: "Beauty & Wellness",
    categories: [
      {
        slug: "bath-body", name: "Bath & Body", icon: "🧼", tint: "#e9f1f6",
        subs: [
          { slug: "soaps-bodywash", name: "Soaps & Body Wash", icon: "🧼", products: [
            p("Sandal Bathing Soap", "Fresh Leaf", "🧼", [["4 x 100 g", 180, 149]], "soap"),
            p("Aloe Body Wash", "Fresh Leaf", "🧴", [["250 ml", 299, 219]], "body wash"),
            p("Hand Wash Refill", "Fresh Leaf", "🫧", [["750 ml", 199, 149]], "hand wash"),
          ]},
          { slug: "oral-care", name: "Oral Care", icon: "🪥", products: [
            p("Herbal Toothpaste", "Bright Smile", "🪥", [["150 g", 110, 99]], "toothpaste"),
            p("Soft Toothbrush (Pack of 4)", "Bright Smile", "🪥", [["4 pcs", 160, 120]], "toothbrush"),
            p("Mint Mouthwash", "Bright Smile", "🫙", [["250 ml", 160, 139]], "mouthwash"),
          ]},
        ],
      },
      {
        slug: "hair-care", name: "Hair Care", icon: "💇", tint: "#f4ece6",
        subs: [
          { slug: "shampoo", name: "Shampoo & Conditioner", icon: "🧴", products: [
            p("Anti-Dandruff Shampoo", "Silk Strand", "🧴", [["340 ml", 399, 299]], "shampoo"),
            p("Smooth Conditioner", "Silk Strand", "🧴", [["180 ml", 250, 199]], "conditioner"),
          ]},
          { slug: "hair-oil", name: "Hair Oil", icon: "🫒", products: [
            p("Pure Coconut Oil", "Silk Strand", "🥥", [["500 ml", 230, 199]], "coconut oil hair"),
            p("Amla Hair Oil", "Silk Strand", "🫒", [["300 ml", 180, 155]], "amla oil"),
          ]},
        ],
      },
      {
        slug: "skin-face", name: "Skin & Face", icon: "✨", tint: "#fbeef1",
        subs: [
          { slug: "face-wash", name: "Face Wash", icon: "🫧", products: [
            p("Neem Face Wash", "Glow Lab", "🫧", [["100 ml", 199, 159]], "face wash neem"),
            p("Vitamin C Foaming Cleanser", "Glow Lab", "🍊", [["150 ml", 349, 279]], "face wash vitamin c"),
          ]},
          { slug: "moisturiser-sunscreen", name: "Moisturiser & Sunscreen", icon: "🌞", products: [
            p("Daily Moisturiser", "Glow Lab", "🧴", [["100 ml", 299, 239]], "moisturiser cream"),
            p("Sunscreen SPF 50", "Glow Lab", "🌞", [["50 g", 399, 329]], "sunscreen spf"),
            p("Lip Balm Strawberry", "Glow Lab", "💄", [["4.5 g", 150, 129]], "lip balm"),
          ]},
        ],
      },
      {
        slug: "baby-care", name: "Baby Care", icon: "🍼", tint: "#eaf6f5",
        subs: [
          { slug: "diapers", name: "Diapers & Wipes", icon: "👶", products: [
            p("Pant Diapers Medium", "Little Steps", "👶", [["56 pcs", 1299, 799]], "diaper pants"),
            p("Baby Wipes (Water)", "Little Steps", "🧻", [["72 pcs", 299, 199]], "wipes"),
          ]},
          { slug: "baby-food", name: "Baby Food", icon: "🍼", products: [
            p("Wheat Apple Cereal (6m+)", "Little Steps", "🥣", [["300 g", 310, 289]], "baby cereal"),
          ]},
        ],
      },
      {
        slug: "health-pharma", name: "Health & Pharma", icon: "💊", tint: "#e8f3ee",
        subs: [
          { slug: "otc", name: "Everyday Medicine", icon: "💊", products: [
            p("Paracetamol 500 mg Strip", "CareWell", "💊", [["15 tablets", 30, 28]], "paracetamol fever"),
            p("ORS Orange Sachets", "CareWell", "🍊", [["5 x 21 g", 110, 99]], "ors electrolyte"),
            p("Vapour Rub Balm", "CareWell", "🫙", [["50 ml", 160, 149]], "balm cold"),
          ]},
          { slug: "first-aid", name: "First Aid & Devices", icon: "🩹", products: [
            p("Adhesive Bandages", "CareWell", "🩹", [["20 strips", 60, 49]], "bandage"),
            p("Digital Thermometer", "CareWell", "🌡️", [["1 pc", 350, 199]], "thermometer"),
            p("Antiseptic Liquid", "CareWell", "🧴", [["250 ml", 150, 135]], "antiseptic"),
          ]},
        ],
      },
    ],
  },
  {
    slug: "home-lifestyle",
    name: "Home & Lifestyle",
    categories: [
      {
        slug: "cleaning", name: "Cleaning Essentials", icon: "🧽", tint: "#e6f1f9",
        subs: [
          { slug: "detergents", name: "Detergents", icon: "🫧", products: [
            p("Matic Liquid Detergent", "Sparkle", "🧴", [["2 L", 499, 379]], "detergent liquid"),
            p("Detergent Powder", "Sparkle", "🫧", [["1 kg", 140, 125]], "detergent powder"),
          ]},
          { slug: "dishwash", name: "Dishwash", icon: "🍽️", products: [
            p("Lemon Dishwash Gel", "Sparkle", "🍋", [["750 ml", 199, 169]], "dishwash"),
            p("Scrub Pads (Pack of 3)", "Sparkle", "🧽", [["3 pcs", 60, 50]], "scrub"),
          ]},
          { slug: "floor-cleaners", name: "Floor & Toilet", icon: "🧹", products: [
            p("Floor Cleaner Lavender", "Sparkle", "🧴", [["1 L", 229, 189]], "floor cleaner"),
            p("Toilet Cleaner", "Sparkle", "🚽", [["1 L", 210, 175]], "toilet cleaner"),
            p("Garbage Bags Medium", "Sparkle", "🗑️", [["30 bags", 120, 89]], "garbage bags"),
          ]},
        ],
      },
      {
        slug: "home-needs", name: "Home Needs", icon: "🏠", tint: "#f1efe9",
        subs: [
          { slug: "tissues", name: "Tissues & Foil", icon: "🧻", products: [
            p("Toilet Rolls (4 ply)", "Softly", "🧻", [["6 rolls", 299, 229]], "toilet paper"),
            p("Kitchen Towel", "Softly", "🧻", [["2 rolls", 150, 119]], "kitchen towel"),
            p("Aluminium Foil 9 m", "Softly", "🪙", [["1 roll", 120, 99]], "foil"),
          ]},
          { slug: "pooja", name: "Pooja Needs", icon: "🪔", products: [
            p("Clay Diyas", "Shubh", "🪔", [["12 pcs", 120, 89]], "diya pooja"),
            p("Agarbatti Sandal", "Shubh", "🕯️", [["100 sticks", 80, 69]], "agarbatti incense"),
            p("Marigold Flower Mix", "Turant Fresh", "🌼", [["100 g", 40, 32]], "flowers pooja"),
          ]},
          { slug: "bulbs-batteries", name: "Bulbs & Batteries", icon: "💡", products: [
            p("LED Bulb 9 W", "HomeVolt", "💡", [["1 pc", 150, 99]], "led bulb"),
            p("AA Batteries", "HomeVolt", "🔋", [["4 pcs", 120, 105]], "battery"),
          ]},
        ],
      },
      {
        slug: "electronics", name: "Electronics", icon: "🎧", tint: "#ecebfa",
        subs: [
          { slug: "audio", name: "Audio", icon: "🎧", products: [
            p("Wireless Earbuds", "Sonic", "🎧", [["1 pair", 2999, 1299]], "earbuds tws"),
            p("Bluetooth Speaker", "Sonic", "🔊", [["1 pc", 1999, 999]], "speaker"),
          ]},
          { slug: "chargers", name: "Chargers & Cables", icon: "🔌", products: [
            p("20 W USB-C Charger", "HomeVolt", "🔌", [["1 pc", 1499, 699]], "charger type c"),
            p("USB-C to USB-C Cable 1 m", "HomeVolt", "🔗", [["1 pc", 599, 249]], "cable"),
            p("Power Bank 10000 mAh", "HomeVolt", "🔋", [["1 pc", 1999, 1099]], "power bank"),
          ]},
        ],
      },
      {
        slug: "stationery-games", name: "Stationery & Games", icon: "✏️", tint: "#fbf3dd",
        subs: [
          { slug: "stationery", name: "Stationery", icon: "📒", products: [
            p("Ruled Notebook A5 (Pack of 3)", "Inkwell", "📒", [["3 pcs", 180, 149]], "notebook"),
            p("Gel Pens Blue (Pack of 5)", "Inkwell", "🖊️", [["5 pcs", 100, 85]], "pen"),
            p("Sticky Notes", "Inkwell", "🗒️", [["100 sheets", 80, 65]], "sticky notes"),
          ]},
          { slug: "toys-games", name: "Toys & Games", icon: "🧸", products: [
            p("Card Game Classic", "Play Day", "🃏", [["1 pack", 199, 149]], "cards game"),
            p("Building Blocks 100 pcs", "Play Day", "🧱", [["1 box", 699, 449]], "blocks lego"),
            p("Soft Teddy Bear", "Play Day", "🧸", [["1 pc", 599, 399]], "teddy"),
          ]},
        ],
      },
      {
        slug: "pet-care", name: "Pet Care", icon: "🐾", tint: "#f6ece4",
        subs: [
          { slug: "dog", name: "Dog Food & Treats", icon: "🐕", products: [
            p("Adult Dog Food Chicken", "Wag & Purr", "🐕", [["1.2 kg", 499, 429]], "dog food"),
            p("Chew Sticks", "Wag & Purr", "🦴", [["10 pcs", 199, 169]], "dog treats"),
          ]},
          { slug: "cat", name: "Cat Food & Litter", icon: "🐈", products: [
            p("Cat Food Ocean Fish", "Wag & Purr", "🐈", [["1.2 kg", 549, 469]], "cat food"),
            p("Clumping Cat Litter", "Wag & Purr", "🪣", [["5 kg", 599, 499]], "litter"),
          ]},
        ],
      },
    ],
  },
];

/** "Shop by store" tiles: each points to a category or a collection. */
export const STOREFRONTS = [
  { slug: "fresh", name: "Fresh Market", icon: "🥬", tint: "#dceeff", href: "/cn/fruits-vegetables" },
  { slug: "pharmacy", name: "Pharmacy", icon: "💊", tint: "#e2f2fb", href: "/cn/health-pharma" },
  { slug: "pets", name: "Pet Shop", icon: "🐶", tint: "#e6e9ff", href: "/cn/pet-care" },
  { slug: "gadgets", name: "Gadget Hub", icon: "🎧", tint: "#dbe8ff", href: "/cn/electronics" },
  { slug: "beauty", name: "Beauty Corner", icon: "💄", tint: "#e9e4ff", href: "/cn/skin-face" },
  { slug: "party", name: "Party Pack", icon: "🎉", tint: "#d9f0fa", href: "/c/party-pack" },
  { slug: "kids", name: "Kids Zone", icon: "🧸", tint: "#e3ecff", href: "/cn/stationery-games" },
  { slug: "home", name: "Home Fixes", icon: "🛠️", tint: "#e0f4f7", href: "/cn/home-needs" },
];

/** Home rails. `rule` picks products; `pick` lists slugs explicitly. */
export const COLLECTIONS: { slug: string; title: string; rule?: { minDiscount?: number; categories?: string[]; subs?: string[]; groups?: string[] }; limit?: number }[] = [
  { slug: "big-savings", title: "Hot deals", rule: { minDiscount: 20, groups: ["groceries", "snacks-drinks"] }, limit: 24 },
  { slug: "fresh-picks", title: "Picked fresh this morning", rule: { categories: ["fruits-vegetables"] }, limit: 20 },
  { slug: "late-night-cravings", title: "Late-night cravings", rule: { categories: ["chips-namkeen", "sweets-chocolates", "ice-creams", "instant-food"] }, limit: 20 },
  { slug: "dairy-daily", title: "Your daily dairy", rule: { categories: ["dairy-bread-eggs"] }, limit: 20 },
  { slug: "party-pack", title: "Party Pack", rule: { subs: ["chips", "soft-drinks", "water-ice", "tubs", "namkeen", "popcorn"] }, limit: 30 },
];

export const BANNERS = [
  { title: "Fresh fruit, picked this morning", body: "Seasonal fruits and veggies from nearby farms", cta: "Shop fresh", href: "/cn/fruits-vegetables", tint: "#dceeff", art: "🍓🥭🍌" },
  { title: "Medicines in minutes", body: "Everyday health essentials, sealed and genuine", cta: "Order now", href: "/cn/health-pharma", tint: "#e2f2fb", art: "💊🩹🌡️" },
  { title: "Treats for your pet", body: "Food, litter and chews they actually like", cta: "Explore", href: "/cn/pet-care", tint: "#e6e9ff", art: "🐶🦴🐱" },
];

export const SEARCH_HINTS = ["milk", "bread", "eggs", "atta", "paneer", "chips", "ice cream", "onion", "coffee", "diapers"];
