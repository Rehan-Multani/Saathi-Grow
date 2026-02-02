import mothersDairyImg from '../assets/images/products/images.jpg';
import cheeseSlicesImg from '../assets/images/products/images (1).jpg';
import buttermilkImg from '../assets/images/products/images (2).jpg';
import paneerImg from '../assets/images/products/images (3).jpg';
import munchiesImg from '../assets/images/products/images (4).jpg';
import coldrinkImg from '../assets/images/products/images4.jpg';

export const products = [
    // Vegetables & Fruits
    {
        id: 1,
        name: 'Fresho Tomato - Hybrid',
        price: 38,
        originalPrice: 50,
        weight: '1 kg',
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
        category: 'vegetables-fruits',
        isBestSeller: true,
        description: 'Sweet and nutritious Robusta bananas. Great source of energy and potassium.'
    },
    {
        id: 101,
        name: 'Fresho Carrot - Orange',
        price: 35,
        originalPrice: 50,
        weight: '500 g',
        image: munchiesImg,
        category: 'vegetables-fruits',
        isBestSeller: false,
        description: 'Fresh and crunchy orange carrots. Rich in Vitamin A.'
    },
    {
        id: 102,
        name: 'Fresho Capsicum - Green',
        price: 40,
        originalPrice: 60,
        weight: '500 g',
        image: munchiesImg,
        category: 'vegetables-fruits',
        isBestSeller: true,
        description: 'Fresh green capsicums. Perfect for stir-fries and salads.'
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
        image: mothersDairyImg,
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
        image: cheeseSlicesImg,
        category: 'dairy-breakfast',
        isBestSeller: false,
        description: 'Classic cheese slices for your sandwiches and burgers. Rich in calcium.'
    },
    {
        id: 103,
        name: 'Amul Masti Spiced Buttermilk',
        price: 15,
        originalPrice: 15,
        weight: '200 ml',
        image: buttermilkImg,
        category: 'dairy-breakfast',
        isBestSeller: true,
        description: 'Refreshing spiced buttermilk. Perfect digestive drink.'
    },
    {
        id: 104,
        name: 'Milky Mist Paneer',
        price: 120,
        originalPrice: 140,
        weight: '200 g',
        image: paneerImg,
        category: 'dairy-breakfast',
        isBestSeller: true,
        description: 'Soft and fresh paneer blocks for delicious curries.'
    },

    // Munchies
    {
        id: 3,
        name: 'Lay\'s India\'s Magic Masala Chips',
        price: 20,
        originalPrice: 20,
        weight: '50g',
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
        category: 'munchies',
        isBestSeller: true,
        description: 'Spicy and tangy crunchy sticks. A classic Indian snack.'
    },
    {
        id: 105,
        name: 'Bingo! Mad Angles - Achaari Masti',
        price: 20,
        originalPrice: 20,
        weight: '70g',
        image: munchiesImg,
        category: 'munchies',
        isBestSeller: false,
        description: 'Unique triangular chips with a tangy pickle flavor.'
    },
    {
        id: 106,
        name: 'Pringles Original',
        price: 100,
        originalPrice: 110,
        weight: '110g',
        image: munchiesImg,
        category: 'munchies',
        isBestSeller: true,
        description: 'International favorite potato crisps. Salty and addictive.'
    },
    {
        id: 107,
        name: 'Haldiram\'s Bhujia Sev',
        price: 50,
        originalPrice: 55,
        weight: '200g',
        image: munchiesImg,
        category: 'munchies',
        isBestSeller: true,
        description: 'Traditional spicy fried noodles. Great tea-time snack.'
    },

    // Cold Drinks & Juices
    {
        id: 4,
        name: 'Coca-Cola Soft Drink - Original Taste',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: coldrinkImg,
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
        image: coldrinkImg,
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
        image: coldrinkImg,
        category: 'cold-drinks-juices',
        isBestSeller: true,
        description: 'Healthy and tasty mixed fruit juice packed with vitamins.'
    },
    {
        id: 108,
        name: 'Sprite Soft Drink - Lime Flavoured',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: coldrinkImg,
        category: 'cold-drinks-juices',
        isBestSeller: true,
        description: 'Clear and refreshing lime soda.'
    },
    {
        id: 109,
        name: 'Thums Up Soft Drink',
        price: 40,
        originalPrice: 40,
        weight: '750 ml',
        image: coldrinkImg,
        category: 'cold-drinks-juices',
        isBestSeller: false,
        description: 'Strong and fizzy cola drink. Taste the thunder.'
    },
    {
        id: 110,
        name: 'Tropicana 100% Orange Juice',
        price: 115,
        originalPrice: 125,
        weight: '1 L',
        image: coldrinkImg,
        category: 'cold-drinks-juices',
        isBestSeller: false,
        description: '100% pure orange juice with no added sugar.'
    },

    // Instant & Frozen Food
    {
        id: 5,
        name: 'McCain French Fries',
        price: 125,
        originalPrice: 150,
        weight: '420g',
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
        category: 'instant-frozen-food',
        isBestSeller: false,
        description: 'Spicy and tangy vegetable soup. Easy to prepare and delicious.'
    },
    {
        id: 111,
        name: 'McCain Aloo Tikki',
        price: 140,
        originalPrice: 160,
        weight: '400g',
        image: munchiesImg,
        category: 'instant-frozen-food',
        isBestSeller: true,
        description: 'Classic potato patties with indian spices.'
    },
    {
        id: 112,
        name: 'Yippee Magic Masala Noodles',
        price: 120,
        originalPrice: 140,
        weight: '240g (Pack of 4)',
        image: munchiesImg,
        category: 'instant-frozen-food',
        isBestSeller: false,
        description: 'Long and non-sticky noodles with magic masala.'
    },
    {
        id: 113,
        name: 'MTR Ready to Eat - Paneer Butter Masala',
        price: 150,
        originalPrice: 170,
        weight: '300g',
        image: paneerImg,
        category: 'instant-frozen-food',
        isBestSeller: false,
        description: 'Rich and creamy paneer curry. Heat and eat.'
    },

    // Tea, Coffee & Health Drinks
    {
        id: 6,
        name: 'Red Label Tea',
        price: 360,
        originalPrice: 400,
        weight: '1 kg',
        image: coldrinkImg,
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
        image: coldrinkImg,
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
        image: coldrinkImg,
        category: 'tea-coffee-health-drinks',
        isBestSeller: false,
        description: 'Nutritious malt drink for kids and adults. Supports growth and immunity.'
    },
    {
        id: 114,
        name: 'Taj Mahal Tea',
        price: 400,
        originalPrice: 450,
        weight: '500g',
        image: coldrinkImg,
        category: 'tea-coffee-health-drinks',
        isBestSeller: true,
        description: 'Premium tea leaves for a royal experience.'
    },
    {
        id: 115,
        name: 'Bru Instant Coffee',
        price: 200,
        originalPrice: 220,
        weight: '50g',
        image: coldrinkImg,
        category: 'tea-coffee-health-drinks',
        isBestSeller: false,
        description: 'Aromatic coffee blend with chicory.'
    },
    {
        id: 116,
        name: 'Bournvita Health Drink',
        price: 240,
        originalPrice: 260,
        weight: '500g',
        image: coldrinkImg,
        category: 'tea-coffee-health-drinks',
        isBestSeller: true,
        description: 'Chocolatey health drink for strength and energy.'
    },

    // Bakery & Biscuits
    {
        id: 7,
        name: 'Britannia Good Day Cashew Cookies',
        price: 35,
        originalPrice: 40,
        weight: '200g',
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
        category: 'bakery-biscuits',
        isBestSeller: false,
        description: 'Healthy brown bread for your daily breakfast toast and sandwiches.'
    },
    {
        id: 117,
        name: 'Sunfeast Dark Fantasy Choco Fills',
        price: 90,
        originalPrice: 100,
        weight: '300g',
        image: munchiesImg,
        category: 'bakery-biscuits',
        isBestSeller: true,
        description: 'Rich chocolate cookie with a molten chocolate center.'
    },
    {
        id: 118,
        name: 'Britannia Maris Gold',
        price: 30,
        originalPrice: 35,
        weight: '400g',
        image: munchiesImg,
        category: 'bakery-biscuits',
        isBestSeller: false,
        description: 'Light and crisp tea biscuits. Zero trans fat.'
    },
    {
        id: 119,
        name: 'Britannia Cake - Fruit',
        price: 55,
        originalPrice: 60,
        weight: '120g',
        image: munchiesImg,
        category: 'bakery-biscuits',
        isBestSeller: true,
        description: 'Soft and fluffy fruit cake. Perfect for snacking.'
    },

    // Atta, Rice & Dal
    {
        id: 8,
        name: 'Fortune Chakki Fresh Atta',
        price: 450,
        originalPrice: 520,
        weight: '10 kg',
        image: munchiesImg,
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
        image: munchiesImg,
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
        image: munchiesImg,
        category: 'atta-rice-dal',
        isBestSeller: false,
        description: 'Unpolished Toor Dal rich in protein. Tastes great and cooks fast.'
    },
    {
        id: 120,
        name: 'Aashirvaad Shudh Chakki Atta',
        price: 460,
        originalPrice: 530,
        weight: '10 kg',
        image: munchiesImg,
        category: 'atta-rice-dal',
        isBestSeller: true,
        description: 'Premium quality wheat flour for soft rotis.'
    },
    {
        id: 121,
        name: 'Daawat Rozana Gold Basmati Rice',
        price: 750,
        originalPrice: 900,
        weight: '5 kg',
        image: munchiesImg,
        category: 'atta-rice-dal',
        isBestSeller: false,
        description: 'Everyday basmati rice with great aroma.'
    },
    {
        id: 122,
        name: 'Tata Sampann Moong Dal',
        price: 140,
        originalPrice: 160,
        weight: '1 kg',
        image: munchiesImg,
        category: 'atta-rice-dal',
        isBestSeller: true,
        description: 'High protein unpolished moong dal.'
    },

    // Cleaning & Household
    {
        id: 27,
        name: 'Surf Excel Easy Wash Detergent Powder',
        price: 110,
        originalPrice: 125,
        weight: '1 kg',
        image: coldrinkImg,
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
        image: coldrinkImg,
        category: 'cleaning-household',
        isBestSeller: false,
        description: 'Lemon power to remove grease and odors from utensils.'
    },
    {
        id: 123,
        name: 'Lizol Floor Cleaner - Citrus',
        price: 200,
        originalPrice: 230,
        weight: '1 L',
        image: coldrinkImg,
        category: 'cleaning-household',
        isBestSeller: true,
        description: 'Kills 99.9% germs. Leaves a fresh citrus fragrance.'
    },
    {
        id: 124,
        name: 'Harpic Toilet Cleaner',
        price: 170,
        originalPrice: 190,
        weight: '1 L',
        image: coldrinkImg,
        category: 'cleaning-household',
        isBestSeller: true,
        description: 'Powerful toilet cleaner for sparkling white finish.'
    },
    {
        id: 125,
        name: 'Comfort Fabric Conditioner - Blue',
        price: 220,
        originalPrice: 250,
        weight: '860 ml',
        image: coldrinkImg,
        category: 'cleaning-household',
        isBestSeller: false,
        description: 'Makes clothes soft and fragrant. Long lasting freshness.'
    },
    {
        id: 126,
        name: 'Ariel Matic Liquid Detergent',
        price: 450,
        originalPrice: 500,
        weight: '2 L',
        image: coldrinkImg,
        category: 'cleaning-household',
        isBestSeller: true,
        description: 'Best for washing machines. Removes tough stains in one wash.'
    },

    // Personal Care
    {
        id: 29,
        name: 'Dettol Original Soap',
        price: 45,
        originalPrice: 50,
        weight: '125g',
        image: coldrinkImg,
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
        image: coldrinkImg,
        category: 'personal-care',
        isBestSeller: true,
        description: 'Stronger teeth and healthy gums. Calcium boost formula.'
    },
    {
        id: 127,
        name: 'Dove Cream Beauty Bar',
        price: 60,
        originalPrice: 65,
        weight: '100g',
        image: coldrinkImg,
        category: 'personal-care',
        isBestSeller: true,
        description: 'Contains 1/4th moisturizing cream for soft skin.'
    },
    {
        id: 128,
        name: 'Sensodyne Toothpaste - Fresh Mint',
        price: 150,
        originalPrice: 170,
        weight: '150g',
        image: coldrinkImg,
        category: 'personal-care',
        isBestSeller: false,
        description: 'Relief from tooth sensitivity. Fresh minty taste.'
    },
    {
        id: 129,
        name: 'Nivea Soft Moisturizer Cream',
        price: 300,
        originalPrice: 350,
        weight: '200 ml',
        image: coldrinkImg,
        category: 'personal-care',
        isBestSeller: true,
        description: 'Light non-greasy moisturizer for face and body.'
    },
    {
        id: 130,
        name: 'Pantene Shampoo - Hair Fall Control',
        price: 450,
        originalPrice: 500,
        weight: '650 ml',
        image: coldrinkImg,
        category: 'personal-care',
        isBestSeller: true,
        description: 'Reduces hair fall and makes hair strong.'
    }
];
