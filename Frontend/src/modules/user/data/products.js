export const products = [
    // 1. Fruit and vegetables
    {
        id: 101,
        name: 'Fresho Tomato - Hybrid',
        price: 38,
        originalPrice: 50,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/tomato/tomato_PNG12581.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-vegetables',
        isBestSeller: true,
        description: 'Fresh, juicy, and hybrid tomatoes sourced directly from farms.'
    },
    {
        id: 102,
        name: 'Fresho Onion',
        price: 25,
        originalPrice: 40,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/onion/onion_PNG3821.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-vegetables',
        isBestSeller: true,
        description: 'Top quality onions that add flavor to your dishes.'
    },
    {
        id: 103,
        name: 'Fresho Potato',
        price: 30,
        originalPrice: 45,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/potato/potato_PNG7078.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-vegetables',
        isBestSeller: false,
        description: 'Starchy and fresh potatoes suitable for frying and boiling.'
    },
    {
        id: 104,
        name: 'Fresho Banana - Robusta',
        price: 45,
        originalPrice: 60,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/banana/banana_PNG827.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-fruits',
        isBestSeller: true,
        description: 'Sweet and nutritious Robusta bananas.'
    },
    {
        id: 105,
        name: 'Fresho Apple - Royal Gala',
        price: 180,
        originalPrice: 220,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/apple/apple_PNG12405.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-fruits',
        isBestSeller: true,
        description: 'Crisp and sweet Royal Gala apples.'
    },
    {
        id: 106,
        name: 'Fresh Spinach (Palak)',
        price: 20,
        originalPrice: 30,
        weight: '250 g',
        image: 'https://pngimg.com/uploads/spinach/spinach_PNG10.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-vegetables',
        isBestSeller: false,
        description: 'Fresh green spinach leaves rich in iron.'
    },
    {
        id: 107,
        name: 'Fresh Carrots',
        price: 40,
        originalPrice: 60,
        weight: '500 g',
        image: 'https://pngimg.com/uploads/carrot/carrot_PNG4985.png',
        category: 'fruit-and-vegetables',
        subCategory: 'fresh-vegetables',
        isBestSeller: false,
        description: 'Crunchy and sweet orange carrots.'
    },

    // 2. Dairy Egg , Frozen
    {
        id: 201,
        name: 'Amul Taaza Milk',
        price: 54,
        originalPrice: 56,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/milk/milk_PNG12760.png',
        category: 'dairy-egg-frozen',
        subCategory: 'milk',
        isBestSeller: true,
        description: 'Pasteurized toned milk, rich in calcium.'
    },
    {
        id: 202,
        name: 'Amul Butter',
        price: 56,
        originalPrice: 58,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/butter/butter_PNG9141.png',
        category: 'dairy-egg-frozen',
        isBestSeller: true,
        description: 'The taste of India. Salty and creamy.'
    },
    {
        id: 203,
        name: 'Britannia Cheese Slices',
        price: 90,
        originalPrice: 100,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/cheese/cheese_PNG25299.png',
        category: 'dairy-egg-frozen',
        isBestSeller: false,
        description: 'Classic cheese slices for sandwiches.'
    },
    {
        id: 204,
        name: 'Farm Fresh Eggs',
        price: 45,
        originalPrice: 55,
        weight: '6 units',
        image: 'https://pngimg.com/uploads/egg/egg_PNG40772.png',
        category: 'dairy-egg-frozen',
        subCategory: 'eggs',
        isBestSeller: true,
        description: 'High quality nutritious eggs.'
    },
    {
        id: 205,
        name: 'Mother Dairy Paneer',
        price: 85,
        originalPrice: 95,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/cheese/cheese_PNG25300.png',
        category: 'dairy-egg-frozen',
        isBestSeller: true,
        description: 'Fresh and soft paneer for your favorite dishes.'
    },
    {
        id: 206,
        name: 'Amul Masti Dahi',
        price: 35,
        originalPrice: 40,
        weight: '400 g',
        image: 'https://pngimg.com/uploads/yogurt/yogurt_PNG15.png',
        category: 'dairy-egg-frozen',
        isBestSeller: true,
        description: 'Thick and creamy curd.'
    },

    // 3. Snacks & Bakery
    {
        id: 301,
        name: 'Lay\'s Magic Masala Chips',
        price: 20,
        originalPrice: 20,
        weight: '50 g',
        image: 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG45.png',
        category: 'snacks-bakery',
        isBestSeller: true,
        description: 'Spicy Indian masala flavor potato chips.'
    },
    {
        id: 302,
        name: 'Britannia Good Day Cookies',
        price: 35,
        originalPrice: 40,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/biscuit/biscuit_PNG92.png',
        category: 'snacks-bakery',
        isBestSeller: true,
        description: 'Buttery cookies with cashews.'
    },
    {
        id: 303,
        name: 'Fresh Brown Bread',
        price: 45,
        originalPrice: 50,
        weight: '400 g',
        image: 'https://pngimg.com/uploads/bread/bread_PNG2265.png',
        category: 'snacks-bakery',
        isBestSeller: false,
        description: 'Soft and healthy brown bread.'
    },
    {
        id: 304,
        name: 'Kurkure Masala Munch',
        price: 20,
        originalPrice: 20,
        weight: '90 g',
        image: 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG10.png',
        category: 'snacks-bakery',
        isBestSeller: true,
        description: 'Spicy and crunchy snacks.'
    },
    {
        id: 305,
        name: 'Parle-G Biscuits',
        price: 15,
        originalPrice: 15,
        weight: '250 g',
        image: 'https://pngimg.com/uploads/biscuit/biscuit_PNG40.png',
        category: 'snacks-bakery',
        isBestSeller: true,
        description: 'The classic glucose biscuit.'
    },
    {
        id: 306,
        name: 'Haldiram Bhujia',
        price: 60,
        originalPrice: 70,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG21.png',
        category: 'snacks-bakery',
        isBestSeller: true,
        description: 'Spicy and savory bhujia.'
    },

    // 4. Food & Beverage
    {
        id: 401,
        name: 'Coca-Cola Soft Drink',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: 'https://pngimg.com/uploads/coca_cola/coca_cola_PNG8913.png',
        category: 'food-beverage',
        isBestSeller: true,
        description: 'Refreshing original taste Coca-Cola.'
    },
    {
        id: 402,
        name: 'Pepsi Soft Drink',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: 'https://pngimg.com/uploads/pepsi/pepsi_PNG8.png',
        category: 'food-beverage',
        isBestSeller: false,
        description: 'Cool and crisp Pepsi.'
    },
    {
        id: 403,
        name: 'Sprite Lime Drink',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: 'https://pngimg.com/uploads/sprite/sprite_PNG98767.png',
        category: 'food-beverage',
        isBestSeller: true,
        description: 'Clear and refreshing lime soda.'
    },
    {
        id: 404,
        name: 'Real Mixed Fruit Juice',
        price: 105,
        originalPrice: 120,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/juice/juice_PNG7192.png',
        category: 'food-beverage',
        isBestSeller: true,
        description: 'Natural mixed fruit juice.'
    },
    {
        id: 405,
        name: 'Red Bull Energy Drink',
        price: 125,
        originalPrice: 125,
        weight: '250 ml',
        image: 'https://pngimg.com/uploads/energy_drink/energy_drink_PNG43.png',
        category: 'food-beverage',
        isBestSeller: false,
        description: 'Revitalizes body and mind.'
    },

    // 8. Staples and grains
    {
        id: 801,
        name: 'Fortune Chakki Atta',
        price: 450,
        originalPrice: 520,
        weight: '10 kg',
        image: 'https://pngimg.com/uploads/flour/flour_PNG10.png',
        category: 'staples-and-grains',
        subCategory: 'atta-flours',
        isBestSeller: false,
        description: '100% whole wheat flour for soft rotis.'
    },
    {
        id: 802,
        name: 'India Gate Basmati Rice',
        price: 800,
        originalPrice: 950,
        weight: '5 kg',
        image: 'https://pngimg.com/uploads/rice/rice_PNG1.png',
        category: 'staples-and-grains',
        subCategory: 'rice-products',
        isBestSeller: true,
        description: 'Aromatic long grain basmati rice.'
    },
    {
        id: 803,
        name: 'Tata Sampann Moong Dal',
        price: 140,
        originalPrice: 160,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/wheat/wheat_PNG57.png',
        category: 'staples-and-grains',
        subCategory: 'dals-pulses',
        isBestSeller: true,
        description: 'Protein rich unpolished Moong Dal.'
    },
    {
        id: 804,
        name: 'Tuar Dal (Arhar)',
        price: 160,
        originalPrice: 180,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/wheat/wheat_PNG18.png',
        category: 'staples-and-grains',
        isBestSeller: true,
        description: 'Essential Indian pulse for daily meals.'
    },
    {
        id: 805,
        name: 'Sugar - Premium Quality',
        price: 50,
        originalPrice: 55,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/sugar/sugar_PNG9.png',
        category: 'staples-and-grains',
        isBestSeller: true,
        description: 'Pure and refined white sugar.'
    },

    // 9. Masala and spices
    {
        id: 901,
        name: 'MDH Deggi Mirch',
        price: 110,
        originalPrice: 120,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/pepper/pepper_PNG1272.png',
        category: 'masala-and-spices',
        isBestSeller: true,
        description: 'Red chilli powder for color and spice.'
    },
    {
        id: 902,
        name: 'Tata Salt',
        price: 25,
        originalPrice: 28,
        weight: '1 kg',
        image: 'https://pngimg.com/uploads/sugar/sugar_PNG10.png',
        category: 'masala-and-spices',
        isBestSeller: true,
        description: 'Desh ka Namak. Pure and iodized.'
    },
    {
        id: 903,
        name: 'Catch Turmeric Powder',
        price: 35,
        originalPrice: 40,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/pepper/pepper_PNG1273.png',
        category: 'masala-and-spices',
        isBestSeller: true,
        description: 'Pure and natural turmeric.'
    },
    {
        id: 904,
        name: 'Everest Garam Masala',
        price: 65,
        originalPrice: 75,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/pepper/pepper_PNG1274.png',
        category: 'masala-and-spices',
        isBestSeller: false,
        description: 'Rich blend of spices for authentic flavor.'
    },

    // 10. Oil and Ghee
    {
        id: 1001,
        name: 'Amul Pure Cow Ghee',
        price: 560,
        originalPrice: 600,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/butter/butter_PNG9141.png',
        category: 'oil-and-ghee',
        isBestSeller: true,
        description: 'Pure and traditional cow ghee.'
    },
    {
        id: 1002,
        name: 'Fortune Sunflower Oil',
        price: 155,
        originalPrice: 180,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/olive_oil/olive_oil_PNG9.png',
        category: 'oil-and-ghee',
        isBestSeller: false,
        description: 'Refined sunflower oil for healthy cooking.'
    },
    {
        id: 1003,
        name: 'Dhara Mustard Oil',
        price: 175,
        originalPrice: 195,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/olive_oil/olive_oil_PNG16.png',
        category: 'oil-and-ghee',
        isBestSeller: true,
        description: 'Traditional mustard oil for Indian cooking.'
    },
    {
        id: 1004,
        name: 'Saffola Gold Oil',
        price: 190,
        originalPrice: 210,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/olive_oil/olive_oil_PNG3.png',
        category: 'oil-and-ghee',
        isBestSeller: true,
        description: 'Balanced oil for heart health.'
    },

    // 11. Personal care
    {
        id: 1101,
        name: 'Dettol Original Soap',
        price: 45,
        originalPrice: 50,
        weight: '125 g',
        image: 'https://pngimg.com/uploads/soap/soap_PNG3968.png',
        category: 'personal-care',
        isBestSeller: true,
        description: 'Antibacterial soap for germ protection.'
    },
    {
        id: 1102,
        name: 'Colgate Strong Teeth',
        price: 95,
        originalPrice: 100,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/toothpaste/toothpaste_PNG1.png',
        category: 'personal-care',
        isBestSeller: true,
        description: 'Stronger teeth with Amino Power.'
    },
    {
        id: 1103,
        name: 'Dove Shampoo',
        price: 240,
        originalPrice: 280,
        weight: '340 ml',
        image: 'https://pngimg.com/uploads/shampoo/shampoo_PNG1.png',
        category: 'personal-care',
        isBestSeller: true,
        description: 'Nourishing shampoo for soft hair.'
    },
    {
        id: 1104,
        name: 'Nivea Body Lotion',
        price: 350,
        originalPrice: 400,
        weight: '400 ml',
        image: 'https://pngimg.com/uploads/body_lotion/body_lotion_PNG32.png',
        category: 'personal-care',
        isBestSeller: false,
        description: 'Moisturizing lotion for dry skin.'
    },
    {
        id: 1105,
        name: 'Gillette Shaving Foam',
        price: 180,
        originalPrice: 200,
        weight: '200 ml',
        image: 'https://pngimg.com/uploads/shaving_foam/shaving_foam_PNG28.png',
        category: 'personal-care',
        isBestSeller: false,
        description: 'Smooth and comfortable shave.'
    },

    // 12. Chocolate & Sweet
    {
        id: 1201,
        name: 'Cadbury Dairy Milk',
        price: 40,
        originalPrice: 40,
        weight: '50 g',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG13.png',
        category: 'chocolate-sweet',
        isBestSeller: true,
        description: 'Classic chocolate bar.'
    },
    {
        id: 1202,
        name: 'Ferrero Rocher',
        price: 550,
        originalPrice: 600,
        weight: '16 units',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG9.png',
        category: 'chocolate-sweet',
        isBestSeller: true,
        description: 'Premium hazelnut chocolates.'
    },
    {
        id: 1203,
        name: 'KitKat 4 Finger',
        price: 30,
        originalPrice: 30,
        weight: '38 g',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG42.png',
        category: 'chocolate-sweet',
        isBestSeller: true,
        description: 'Crisp wafer fingers in milk chocolate.'
    },
    {
        id: 1204,
        name: 'Snickers Peanut Bar',
        price: 50,
        originalPrice: 50,
        weight: '50 g',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG5.png',
        category: 'chocolate-sweet',
        isBestSeller: true,
        description: 'Hungry? Grab a Snickers.'
    },
    {
        id: 1205,
        name: 'Lindt Excellence Dark',
        price: 250,
        originalPrice: 300,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG3.png',
        category: 'chocolate-sweet',
        isBestSeller: false,
        description: 'Premium dark chocolate bar.'
    },
    {
        id: 1206,
        name: 'Toblerone Milk',
        price: 180,
        originalPrice: 200,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG1.png',
        category: 'chocolate-sweet',
        isBestSeller: false,
        description: 'Unique triangular Swiss chocolate.'
    },

    // 13. Dry Fruit
    {
        id: 1301,
        name: 'Happilo Almonds',
        price: 150,
        originalPrice: 180,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/hazelnut/hazelnut_PNG35.png',
        category: 'dry-fruit',
        isBestSeller: true,
        description: 'Premium California almonds.'
    },
    {
        id: 1302,
        name: 'Happilo Cashews',
        price: 180,
        originalPrice: 210,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/hazelnut/hazelnut_PNG37.png',
        category: 'dry-fruit',
        isBestSeller: true,
        description: 'Crunchy and whole cashews.'
    },
    {
        id: 1303,
        name: 'Pistachios (Pista)',
        price: 250,
        originalPrice: 300,
        weight: '200 g',
        image: 'https://pngimg.com/uploads/hazelnut/hazelnut_PNG32.png',
        category: 'dry-fruit',
        isBestSeller: false,
        description: 'Roasted and salted pistachios.'
    },
    {
        id: 1304,
        name: 'Walnuts (Akhrot)',
        price: 350,
        originalPrice: 400,
        weight: '250 g',
        image: 'https://pngimg.com/uploads/hazelnut/hazelnut_PNG41.png',
        category: 'dry-fruit',
        isBestSeller: true,
        description: 'Healthy walnut kernels.'
    },

    // 14. Cleaning Essentials
    {
        id: 1401,
        name: 'Surf Excel Liquid',
        price: 220,
        originalPrice: 250,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/detergent/detergent_PNG40.png',
        category: 'cleaning-essentials',
        isBestSeller: true,
        description: 'Tough stain removal liquid detergent.'
    },
    {
        id: 1402,
        name: 'Lizol Floor Cleaner',
        price: 200,
        originalPrice: 230,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/detergent/detergent_PNG1.png',
        category: 'cleaning-essentials',
        isBestSeller: false,
        description: 'Germ killing floor cleaner.'
    },
    {
        id: 1403,
        name: 'Comfort Fabric Conditioner',
        price: 180,
        originalPrice: 200,
        weight: '860 ml',
        image: 'https://pngimg.com/uploads/detergent/detergent_PNG33.png',
        category: 'cleaning-essentials',
        isBestSeller: true,
        description: 'Soft and fragrant clothes conditioner.'
    },
    {
        id: 1404,
        name: 'Harpic Toilet Cleaner',
        price: 160,
        originalPrice: 180,
        weight: '1 L',
        image: 'https://pngimg.com/uploads/detergent/detergent_PNG21.png',
        category: 'cleaning-essentials',
        isBestSeller: true,
        description: 'Effective toilet bowl cleaner.'
    },

    // 15. Home & Office
    {
        id: 1501,
        name: 'A4 Paper Bundle',
        price: 350,
        originalPrice: 400,
        weight: '500 sheets',
        image: 'https://pngimg.com/uploads/paper_sheet/paper_sheet_PNG8131.png',
        category: 'home-office',
        isBestSeller: true,
        description: 'High quality A4 printer paper.'
    },
    {
        id: 1502,
        name: 'Camel Oil Pastels',
        price: 120,
        originalPrice: 150,
        weight: '25 shades',
        image: 'https://pngimg.com/uploads/pencil/pencil_PNG40.png',
        category: 'home-office',
        isBestSeller: false,
        description: 'Vibrant colors for art and craft.'
    },
    {
        id: 1503,
        name: 'Notebook Pack of 6',
        price: 300,
        originalPrice: 360,
        weight: '6 units',
        image: 'https://pngimg.com/uploads/book/book_PNG2116.png',
        category: 'home-office',
        isBestSeller: true,
        description: 'Soft cover ruled notebooks.'
    },

    // 16. Pet Care
    {
        id: 1601,
        name: 'Pedigree Dog Food',
        price: 450,
        originalPrice: 500,
        weight: '3 kg',
        image: 'https://pngimg.com/uploads/dog_food/dog_food_PNG43.png',
        category: 'pet-care',
        isBestSeller: true,
        description: 'Complete and balanced meal for dogs.'
    },
    {
        id: 1602,
        name: 'Whiskas Cat Food',
        price: 350,
        originalPrice: 400,
        weight: '1.2 kg',
        image: 'https://pngimg.com/uploads/cat_food/cat_food_PNG44.png',
        category: 'pet-care',
        isBestSeller: true,
        description: 'Nutritious meal for your adult cat.'
    },
    {
        id: 1603,
        name: 'Drools Dog Treats',
        price: 120,
        originalPrice: 150,
        weight: '100 g',
        image: 'https://pngimg.com/uploads/dog_food/dog_food_PNG10.png',
        category: 'pet-care',
        isBestSeller: false,
        description: 'Delicious treats for rewarding your pet.'
    },

    // 18. Beauty & Grooming
    {
        id: 1801,
        name: 'Loreal Face Wash',
        price: 150,
        originalPrice: 180,
        weight: '100 ml',
        image: 'https://pngimg.com/uploads/soap/soap_PNG3968.png',
        category: 'beauty-grooming',
        isBestSeller: false,
        description: 'Purifying face wash for glowing skin.'
    },
    {
        id: 1802,
        name: 'Maybelline Lipstick',
        price: 450,
        originalPrice: 600,
        weight: '4 g',
        image: 'https://pngimg.com/uploads/lipstick/lipstick_PNG32.png',
        category: 'beauty-grooming',
        isBestSeller: true,
        description: 'Long lasting matte lipstick.'
    },
    {
        id: 1803,
        name: 'Beardo Beard Oil',
        price: 250,
        originalPrice: 300,
        weight: '30 ml',
        image: 'https://pngimg.com/uploads/body_lotion/body_lotion_PNG28.png',
        category: 'beauty-grooming',
        isBestSeller: false,
        description: 'Nourish your beard for a stylish look.'
    }
];
