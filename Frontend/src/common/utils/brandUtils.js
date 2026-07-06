export const normalizeBrandCategories = (category) => {
    if (!category) return [];
    if (Array.isArray(category)) return category.filter(Boolean);
    return [category].filter(Boolean);
};

export const brandMatchesCategory = (brand, categoryName) => {
    if (!categoryName) return false;
    const selected = String(categoryName).toLowerCase().trim();
    return normalizeBrandCategories(brand?.category).some(
        (cat) => String(cat).toLowerCase().trim() === selected
    );
};

export const formatBrandCategories = (category) => normalizeBrandCategories(category).join(', ');
