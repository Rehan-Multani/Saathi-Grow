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
          <h2 className="category-landing-heading text-[18px] font-bold uppercase tracking-tight text-gray-900 dark:text-white sm:text-[22px]">
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

      <div className="category-landing-subscroll flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {(section.items || []).map((item) => (
          <button
            key={item._id}
            onClick={() => navigate(`/category/${encodeURIComponent(categorySlug)}/products?sub=${encodeURIComponent(item.name)}`)}
            className="category-landing-subcard group flex flex-col items-center flex-shrink-0 transition-all active:scale-95"
            style={{ width: '74px' }}
          >
            {/* Square Media Box at Top */}
            <div 
              className="rounded-2xl flex flex-col items-center border border-black/5 bg-white dark:bg-white/5 shadow-sm overflow-hidden group-hover:border-green-500/30 transition-all"
              style={{ backgroundColor: cardBg, width: '74px', height: '74px', minWidth: '74px' }}
            >
              {/* Label inside at top */}
              <span 
                className="font-bold text-gray-900 dark:text-gray-100 text-center capitalize group-hover:text-green-600 transition-colors"
                style={{ fontSize: '9px', paddingTop: '10px', width: '100%', paddingLeft: '4px', paddingRight: '4px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {item.name?.toLowerCase()}
              </span>

              {/* Image below label */}
              <div 
                className="flex-1 w-full flex items-center justify-center p-2"
                style={{ overflow: 'hidden' }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="transition-transform duration-300 group-hover:scale-110"
                    style={{ maxHeight: '28px', width: 'auto', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholder;
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ backgroundColor: accentColor, width: '28px', height: '28px', fontSize: '10px', fontWeight: '700' }}
                  >
                    {getInitials(item.name)}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategorySubcategoryGrid;
