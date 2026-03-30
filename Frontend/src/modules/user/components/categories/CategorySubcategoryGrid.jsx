import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ASSET_URLS } from '../../../../constants/assetUrls';

const placeholder = ASSET_URLS.placeholder;

const CategorySubcategoryGrid = ({ categorySlug, section, accentColor = '#0c831f', cardBg = '#ffffff' }) => {
  const navigate = useNavigate();
  const getInitials = (label = '') =>
    label
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'SG';

  return (
    <section className="category-landing-section space-y-2.5 sm:space-y-3">
      {section.title && (
        <div className="category-landing-section-head flex items-center justify-between gap-3">
          <h2 className="category-landing-heading text-[18px] font-black uppercase tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
            {section.title}
          </h2>
          {section.ctaLink && (
            <button
              onClick={() => navigate(section.ctaLink)}
              className="category-landing-icon-btn flex h-9 w-9 items-center justify-center rounded-[18px] border border-black/5 bg-white/90 text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white sm:h-10 sm:w-10 sm:rounded-2xl"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}

      {section.subtitle && (
        <p className="category-landing-subtitle text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
          {section.subtitle}
        </p>
      )}

      <div className="category-landing-subgrid grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {(section.items || []).map((item) => (
          <button
            key={item._id}
            onClick={() => navigate(`/category/${encodeURIComponent(categorySlug)}/products?sub=${encodeURIComponent(item.name)}`)}
            className="category-landing-subcard group rounded-[20px] border border-[#dceadf] p-2.5 text-left shadow-[0_10px_30px_rgba(12,131,31,0.08)] transition-all hover:-translate-y-1 dark:border-white/10 sm:rounded-[24px] sm:p-3"
            style={{ backgroundColor: item.bgColor || cardBg }}
          >
            <div className="category-landing-subcard-media mb-2.5 flex h-20 items-center justify-center overflow-hidden rounded-[16px] bg-white/80 p-2 dark:bg-black/20 sm:mb-3 sm:h-24 sm:rounded-[18px]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholder;
                  }}
                  loading="lazy"
                />
              ) : (
                <div
                  className="category-landing-subcard-placeholder relative flex h-full w-full items-center justify-center overflow-hidden rounded-[16px] sm:rounded-[18px]"
                  style={{
                    background: `radial-gradient(circle at top right, ${accentColor}18, transparent 38%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(237,247,239,0.92))`
                  }}
                >
                  <div
                    className="category-landing-subcard-placeholder-mark flex h-11 w-11 items-center justify-center rounded-[16px] text-[16px] font-black text-white shadow-sm sm:h-12 sm:w-12"
                    style={{ backgroundColor: accentColor }}
                  >
                    {getInitials(item.name)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="category-landing-subcard-title text-[11px] font-black leading-tight text-gray-900 dark:text-white sm:text-[13px]">
                {item.name}
              </div>
              <div
                className="category-landing-chip-icon mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white sm:h-7 sm:w-7"
                style={{ backgroundColor: accentColor }}
              >
                <ChevronRight size={13} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySubcategoryGrid;
