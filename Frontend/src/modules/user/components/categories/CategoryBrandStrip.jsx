import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryBrandStrip = ({ section, accentColor = '#0c831f' }) => {
  const navigate = useNavigate();

  return (
    <section className="category-landing-section space-y-2.5 sm:space-y-3">
      {section.title && (
        <h2 className="category-landing-heading text-[18px] font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
          {section.title}
        </h2>
      )}

      {section.subtitle && (
        <p className="category-landing-subtitle text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
          {section.subtitle}
        </p>
      )}

      <div className="category-landing-scroll category-landing-brand-strip flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide sm:gap-3">
        {(section.items || []).map((brand) => (
          <button
            key={brand._id}
            onClick={() => navigate(`/brand/${encodeURIComponent(brand.name)}`)}
            className="category-landing-brand-item group w-[74px] flex-shrink-0 sm:w-[92px]"
          >
            <div className="category-landing-brand-card flex h-[74px] w-[74px] items-center justify-center rounded-[20px] border border-gray-200 bg-white p-3 shadow-sm transition-all group-hover:-translate-y-1 dark:border-white/10 dark:bg-[#101010] sm:h-[92px] sm:w-[92px] sm:rounded-[24px] sm:p-4">
              {brand.logo ? (
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px]">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackNode = e.currentTarget.nextElementSibling;
                      if (fallbackNode) {
                        fallbackNode.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="hidden h-full w-full items-center justify-center rounded-[16px] text-center text-[11px] font-black text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {brand.name?.slice(0, 2)?.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-2xl text-center text-[11px] font-black text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {brand.name?.slice(0, 2)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="category-landing-brand-label mt-1.5 truncate text-center text-[10px] font-bold text-gray-700 dark:text-gray-300 sm:mt-2 sm:text-[12px]">
              {brand.name}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryBrandStrip;
