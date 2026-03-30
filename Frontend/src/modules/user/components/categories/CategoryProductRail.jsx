import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import { normalizeProduct } from '../../pages/home/HomePage';

const CategoryProductRail = ({ section, categorySlug, accentColor = '#0c831f' }) => {
  const navigate = useNavigate();
  const products = (section.products || []).map(normalizeProduct);

  if (products.length === 0) return null;

  return (
    <section className="category-landing-section space-y-2.5 sm:space-y-3">
      <div className="category-landing-section-head flex items-center justify-between gap-3">
        <div>
          {section.title && (
            <h2 className="category-landing-heading text-[18px] font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
              {section.title}
            </h2>
          )}
          {section.subtitle && (
            <p className="category-landing-subtitle mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              {section.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(section.ctaLink || `/category/${encodeURIComponent(categorySlug)}/products`)}
          className="category-landing-icon-btn flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[18px] border border-black/5 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white sm:h-11 sm:w-11 sm:rounded-2xl"
          style={{ color: accentColor }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="category-landing-scroll category-landing-product-strip flex gap-2.5 overflow-x-auto pb-2.5 scrollbar-hide sm:gap-3 sm:pb-3">
        {products.map((product) => (
          <div key={product.id} className="category-landing-rail-card w-[144px] flex-shrink-0 sm:w-[168px]">
            <ProductCard product={product} isCompact={true} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryProductRail;
