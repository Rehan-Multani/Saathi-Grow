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

      <div className="category-landing-scroll category-landing-brand-strip flex gap-3 overflow-x-auto pb-4 scrollbar-hide lg-scrollbar-show -mx-4 px-4 sm:mx-0 sm:px-0">
        {(section.items || []).map((brand) => (
          <button
            key={brand._id}
            onClick={() => navigate(`/brand/${encodeURIComponent(brand.name)}`)}
            className="category-landing-brand-item group flex flex-col items-center flex-shrink-0 w-[62px] text-center transition-all active:scale-95"
          >
            <div className="category-landing-brand-media mb-1.5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`${brand.logo ? 'hidden' : 'flex'} h-full w-full items-center justify-center text-[14px] font-black text-white`}
                style={{ backgroundColor: accentColor }}
              >
                {brand.name?.slice(0, 2)?.toUpperCase()}
              </div>
            </div>
            <div className="category-landing-brand-label w-full truncate px-1 text-[9px] font-bold text-gray-700 dark:text-gray-400">
              {brand.name}
            </div>
          </button>
        ))}
      </div>



    </section>
  );
};

export default CategoryBrandStrip;
