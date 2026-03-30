import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import CategorySubcategoryGrid from './CategorySubcategoryGrid';
import CategoryBrandStrip from './CategoryBrandStrip';
import CategoryPromoBanner from './CategoryPromoBanner';
import CategoryProductRail from './CategoryProductRail';

const CategorySectionRenderer = ({ categorySlug, section, theme }) => {
  const navigate = useNavigate();

  if (section.type === 'subcategory_grid') {
    return (
      <CategorySubcategoryGrid
        categorySlug={categorySlug}
        section={section}
        accentColor={theme?.accent}
        cardBg={theme?.cardBg}
      />
    );
  }

  if (section.type === 'brand_strip') {
    return <CategoryBrandStrip section={section} accentColor={theme?.accent} />;
  }

  if (section.type === 'promo_banner') {
    return <CategoryPromoBanner section={section} accentColor={theme?.accent} />;
  }


  if (section.type === 'product_rail') {
    return (
      <CategoryProductRail
        categorySlug={categorySlug}
        section={section}
        accentColor={theme?.accent}
      />
    );
  }

  if (section.type === 'view_more_cta') {
    return (
      <section className="category-landing-section">
        <button
          onClick={() => navigate(section.ctaLink || `/category/${encodeURIComponent(categorySlug)}/products`)}
          className="category-landing-cta flex w-full items-center justify-center gap-2.5 rounded-[20px] border border-[#dceadf] bg-white px-4 py-3 text-[14px] font-black text-[#0c831f] shadow-sm dark:border-white/10 dark:bg-[#111111] sm:rounded-[24px] sm:px-5 sm:py-4 sm:text-base"
          style={{ color: theme?.accent }}
        >
          <span>{section.ctaLabel || 'View more products'}</span>
          <ChevronRight size={16} />
        </button>
      </section>
    );
  }

  return null;
};

export default CategorySectionRenderer;
