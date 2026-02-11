export const getOccasionConfig = (slug) => {
    switch (slug) {
        case 'valentine-week':
            return {
                title: "Valentine's Week Special",
                subtitle: "Gifts for your loved ones",
                description: "Celebrate love with our specially curated gifts and chocolates.",
                themeColor: "#e91e63", // Pink
                bgColor: "#fce4ec", // Light Pink
                accentColor: "#f8bbd0",
                productIds: [1201, 1202, 1203, 1205, 1206, 1802, 1104], // Chocolates, Grooming
                icon: "💖"
            };
        case 'shivratri-essentials':
            return {
                title: "Shivratri Essentials",
                subtitle: "Fasting & Pooja Needs",
                description: "Everything you need for your holy fasting and prayers.",
                themeColor: "#ff9800", // Orange
                bgColor: "#fff3e0", // Light Orange
                accentColor: "#ffe0b2",
                productIds: [104, 105, 106, 201, 206, 805, 1001, 1301, 1302, 103], // Fruits, Milk, Dry Fruits
                icon: "🕉️"
            };
        case 'saathi-select':
            return {
                title: "Saathi Signature",
                subtitle: "Our Premium Collection",
                description: "Experience the finest quality with Saathi Gro's exclusive signature range.",
                themeColor: "#15803d", // Brand Green (green-700)
                bgColor: "#f0fdf4", // Light Green (green-50)
                accentColor: "#dcfce7", // green-100
                productIds: [101, 102, 103, 104, 105, 106], // Staples: Tomato, Onion, Potato, Banana, etc.
                icon: "🌿"
            };
        default:
            return null;
    }
};
