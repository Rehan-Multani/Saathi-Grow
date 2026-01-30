export const products = [
    // Vegetables & Fruits
    {
        id: 1,
        name: 'Fresho Tomato - Hybrid',
        price: 38,
        originalPrice: 50,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000200_17-fresho-tomato-hybrid.jpg',
        category: 'vegetables-fruits',
        isBestSeller: true,
        description: 'Fresh, juicy, and hybrid tomatoes sourced directly from farms. Perfect for salads, curries, and soups.'
    },
    {
        id: 9,
        name: 'Fresho Onion',
        price: 25,
        originalPrice: 40,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000148_32-fresho-onion.jpg',
        category: 'vegetables-fruits',
        isBestSeller: true,
        description: 'Top quality onions that add flavor to your dishes. Essential for every kitchen.'
    },
    {
        id: 10,
        name: 'Fresho Potato',
        price: 30,
        originalPrice: 45,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000159_27-fresho-potato.jpg',
        category: 'vegetables-fruits',
        isBestSeller: false,
        description: 'Starchy and fresh potatoes suitable for frying, boiling, and baking.'
    },
    {
        id: 11,
        name: 'Fresho Banana - Robusta',
        price: 45,
        originalPrice: 60,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000031_21-fresho-banana-robusta.jpg',
        category: 'vegetables-fruits',
        isBestSeller: true,
        description: 'Sweet and nutritious Robusta bananas. Great source of energy and potassium.'
    },

    // Dairy & Breakfast
    {
        id: 2,
        name: 'Amul Taaza Fresh Toned Milk',
        price: 54,
        originalPrice: 56,
        weight: '1 L',
        image: 'https://www.bigbasket.com/media/uploads/p/l/306926_4-amul-taaza-fresh-toned-milk.jpg',
        category: 'dairy-breakfast',
        isBestSeller: true,
        description: 'Pasteurized toned milk, rich in calcium and protein. Ideal for daily consumption.'
    },
    {
        id: 12,
        name: 'Mothers Dairy Milk',
        price: 66,
        originalPrice: 70,
        weight: '1 L',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40147470_2-mother-dairy-milk-toned.jpg',
        category: 'dairy-breakfast',
        isBestSeller: false,
        description: 'Fresh and pure milk from Mother Dairy. Perfect for tea, coffee, and shakes.'
    },
    {
        id: 13,
        name: 'Amul Butter - Pasteurized',
        price: 56,
        originalPrice: 58,
        weight: '100 g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/1200163_4-amul-butter-pasteurised.jpg',
        category: 'dairy-breakfast',
        isBestSeller: true,
        description: 'The taste of India. Amul Butter is creamy, salty, and perfect for toast and parathas.'
    },
    {
        id: 14,
        name: 'Britannia Cheese Slices',
        price: 90,
        originalPrice: 100,
        weight: '100 g (5 slices)',
        image: 'https://www.bigbasket.com/media/uploads/p/l/104709_7-britannia-cheese-slices.jpg',
        category: 'dairy-breakfast',
        isBestSeller: false,
        description: 'Classic cheese slices for your sandwiches and burgers. Rich in calcium.'
    },

    // Munchies
    {
        id: 3,
        name: 'Lay\'s India\'s Magic Masala Chips',
        price: 20,
        originalPrice: 20,
        weight: '50g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40196813_4-lays-potato-chips-indias-magic-masala.jpg',
        category: 'munchies',
        isBestSeller: false,
        description: 'Crispy potato chips with a spicy Indian masala flavor. A favorite snack for everyone.'
    },
    {
        id: 15,
        name: 'Doritos Nacho Cheese',
        price: 30,
        originalPrice: 30,
        weight: '60g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/1212624_1-doritos-corn-chips-nacho-cheese.jpg',
        category: 'munchies',
        isBestSeller: true,
        description: 'Crunchy corn chips with a bold nacho cheese flavor. Perfect for dipping.'
    },
    {
        id: 16,
        name: 'Kurkure Masala Munch',
        price: 20,
        originalPrice: 20,
        weight: '80g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/294248_18-kurkure-namkeen-masala-munch.jpg',
        category: 'munchies',
        isBestSeller: true,
        description: 'Spicy and tangy crunchy sticks. A classic Indian snack.'
    },

    // Cold Drinks & Juices
    {
        id: 4,
        name: 'Coca-Cola Soft Drink - Original Taste',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: 'https://www.bigbasket.com/media/uploads/p/l/251040_10-coca-cola-soft-drink-original-taste.jpg',
        category: 'cold-drinks-juices',
        isBestSeller: true,
        description: 'The refreshing taste of Coca-Cola. Best served chilled.'
    },
    {
        id: 17,
        name: 'Pepsi Soft Drink',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266070_10-pepsi-soft-drink.jpg',
        category: 'cold-drinks-juices',
        isBestSeller: false,
        description: 'Refreshing Pepsi soft drink. A great companion for meals and parties.'
    },
    {
        id: 18,
        name: 'Real Fruit Power Juice - Mixed Fruit',
        price: 110,
        originalPrice: 120,
        weight: '1 L',
        image: 'https://www.bigbasket.com/media/uploads/p/l/1200373_7-real-fruit-power-fruit-juice-mixed-fruit.jpg',
        category: 'cold-drinks-juices',
        isBestSeller: true,
        description: 'Healthy and tasty mixed fruit juice packed with vitamins.'
    },

    // Instant & Frozen Food
    {
        id: 5,
        name: 'McCain French Fries',
        price: 125,
        originalPrice: 150,
        weight: '420g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40226388_1-mccain-french-fries-original.jpg',
        category: 'instant-frozen-food',
        isBestSeller: false,
        description: 'Crispy frozen french fries ready to fry or bake. A perfect snack.'
    },
    {
        id: 19,
        name: 'Maggi 2-Minute Noodles - Masala',
        price: 140,
        originalPrice: 160,
        weight: '560g (Pack of 8)',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266109_18-maggi-2-minute-instant-noodles-masala.jpg',
        category: 'instant-frozen-food',
        isBestSeller: true,
        description: 'India’s favorite instant noodles. Ready in just 2 minutes.'
    },
    {
        id: 20,
        name: 'Knorr Hot & Sour Veg Soup',
        price: 10,
        originalPrice: 10,
        weight: '43g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266158_10-knorr-soup-hot-sour-vegetable.jpg',
        category: 'instant-frozen-food',
        isBestSeller: false,
        description: 'Spicy and tangy vegetable soup. Easy to prepare and delicious.'
    },

    // Tea, Coffee & Health Drinks
    {
        id: 6,
        name: 'Red Label Tea',
        price: 360,
        originalPrice: 400,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266580_16-red-label-tea.jpg',
        category: 'tea-coffee-health-drinks',
        isBestSeller: true,
        description: 'Strong and aromatic tea. Wake up to the perfect cup of chai.'
    },
    {
        id: 21,
        name: 'Nescafe Classic Coffee',
        price: 330,
        originalPrice: 350,
        weight: '100g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266509_14-nescafe-classic-instant-coffee.jpg',
        category: 'tea-coffee-health-drinks',
        isBestSeller: true,
        description: '100% pure instant coffee. Rich aroma and smooth taste.'
    },
    {
        id: 22,
        name: 'Horlicks Health Drink - Classic Malt',
        price: 250,
        originalPrice: 280,
        weight: '500g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000086_20-horlicks-health-drink-classic-malt.jpg',
        category: 'tea-coffee-health-drinks',
        isBestSeller: false,
        description: 'Nutritious malt drink for kids and adults. Supports growth and immunity.'
    },

    // Bakery & Biscuits
    {
        id: 7,
        name: 'Britannia Good Day Cashew Cookies',
        price: 35,
        originalPrice: 40,
        weight: '200g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40286829_3-britannia-good-day-cashew-cookies-richness-of-cashews-badam.jpg',
        category: 'bakery-biscuits',
        isBestSeller: true,
        description: 'Buttery cookies loaded with cashews. Keep smiling properly.'
    },
    {
        id: 23,
        name: 'Parle-G Gold Biscuits',
        price: 30,
        originalPrice: 30,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40067645_4-parle-parle-g-gold-glucose-biscuits.jpg',
        category: 'bakery-biscuits',
        isBestSeller: true,
        description: 'The genius of energy. Classic glucose biscuits loved by generations.'
    },
    {
        id: 24,
        name: 'Modern Bread - Brown',
        price: 45,
        originalPrice: 50,
        weight: '400g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40003058_4-modern-bread-wheaty-brown.jpg',
        category: 'bakery-biscuits',
        isBestSeller: false,
        description: 'Healthy brown bread for your daily breakfast toast and sandwiches.'
    },

    // Atta, Rice & Dal
    {
        id: 8,
        name: 'Fortune Chakki Fresh Atta',
        price: 450,
        originalPrice: 520,
        weight: '10 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000407_12-fortune-chakki-fresh-atta.jpg',
        category: 'atta-rice-dal',
        isBestSeller: false,
        description: '100% whole wheat atta. Soft rotis guaranteed.'
    },
    {
        id: 25,
        name: 'India Gate Basmati Rice',
        price: 800,
        originalPrice: 950,
        weight: '5 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/10000418_14-india-gate-basmati-rice-feast-rozana.jpg',
        category: 'atta-rice-dal',
        isBestSeller: true,
        description: 'Long grain aromatic basmati rice. Perfect for biryani and pulao.'
    },
    {
        id: 26,
        name: 'Tata Sampann Tur Toor Dal',
        price: 180,
        originalPrice: 200,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40000291_9-tata-sampann-unpolished-toor-dal-arhar-dal.jpg',
        category: 'atta-rice-dal',
        isBestSeller: false,
        description: 'Unpolished Toor Dal rich in protein. Tastes great and cooks fast.'
    },

    // Cleaning & Household (New Category Items)
    {
        id: 27,
        name: 'Surf Excel Easy Wash Detergent Powder',
        price: 110,
        originalPrice: 125,
        weight: '1 kg',
        image: 'https://www.bigbasket.com/media/uploads/p/l/266979_26-surf-excel-easy-wash-detergent-powder.jpg',
        category: 'cleaning-household',
        isBestSeller: true,
        description: 'Removes tough stains easily. Keeps clothes looking new.'
    },
    {
        id: 28,
        name: 'Vim Dishwash Bar',
        price: 20,
        originalPrice: 20,
        weight: '200g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40000295_17-vim-dishwash-bar-lemon.jpg',
        category: 'cleaning-household',
        isBestSeller: false,
        description: 'Lemon power to remove grease and odors from utensils.'
    },

    // Personal Care (New Category Items)
    {
        id: 29,
        name: 'Dettol Original Soap',
        price: 45,
        originalPrice: 50,
        weight: '125g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40007823_14-dettol-bathing-soap-original.jpg',
        category: 'personal-care',
        isBestSeller: true,
        description: 'Protects from 100 illness-causing germs. Trusted protection.'
    },
    {
        id: 30,
        name: 'Colgate Strong Teeth Toothpaste',
        price: 95,
        originalPrice: 100,
        weight: '200g',
        image: 'https://www.bigbasket.com/media/uploads/p/l/40092789_5-colgate-strong-teeth-anticavity-toothpaste-with-amino-shakti-calcium.jpg',
        category: 'personal-care',
        isBestSeller: true,
        description: 'Stronger teeth and healthy gums. Calcium boost formula.'
    }
];
