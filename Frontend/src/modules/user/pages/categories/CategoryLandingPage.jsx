import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import SEO from '../../../../common/components/SEO';
import { useSearch } from '../../context/SearchContext';
import { useStore } from '../../context/StoreContext';
import { fetchCategoryPage } from '../../api/categoryPageApi';
import CategoryLandingSkeleton from '../../components/categories/CategoryLandingSkeleton';
import CategorySectionRenderer from '../../components/categories/CategorySectionRenderer';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const defaultTheme = {
  pageBg: '#f6fbf7',
  heroBg: '#eef8f0',
  cardBg: '#ffffff',
  accent: '#0c831f',
  text: '#111827'
};

const CategoryLandingPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setIsSearchOverlayOpen } = useSearch();
  const { activeStore } = useStore();
  const { isDarkMode } = useTheme();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectToProducts, setRedirectToProducts] = useState(false);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const latestRequestKeyRef = useRef('');

  const requestKey = useMemo(
    () => [slug, activeStore?.id || 'all', activeStore?.type || 'default'].join('::'),
    [slug, activeStore?.id, activeStore?.type]
  );

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    latestRequestKeyRef.current = requestKey;

    const loadPage = async () => {
      const isSameCategory = data?.category?.slug === slug;

      if (!data || !isSameCategory) {
        setLoading(true);
      }

      setError(null);
      setRedirectToProducts(false);

      try {
        const pageData = await fetchCategoryPage(slug, {
          storeId: activeStore?.id,
          storeType: activeStore?.type
        });

        if (isMounted && latestRequestKeyRef.current === requestKey) {
          setData(pageData);
        }
      } catch (err) {
        if (!isMounted || latestRequestKeyRef.current !== requestKey) return;

        if (err.status === 404) {
          setData(null);
          setRedirectToProducts(true);
          return;
        }

        setError(err);
      } finally {
        if (isMounted && latestRequestKeyRef.current === requestKey) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [slug, activeStore?.id, activeStore?.type, requestKey]);

  const theme = useMemo(() => {
    const rawTheme = { ...defaultTheme, ...(data?.page?.theme || {}) };
    if (!isDarkMode) return rawTheme;

    // Force mobile-app dark mode defaults if user hasn't defined specific dark colors
    return {
      ...rawTheme,
      pageBg: '#000000',
      heroBg: '#0f0f0f',
      cardBg: '#121212',
      accent: rawTheme.accent || '#0c831f',
      text: '#ffffff'
    };
  }, [data, isDarkMode]);
  const isCurrentCategoryData = data?.category?.slug === slug;

  const category = data?.category;
  const page = data?.page;
  const banners = useMemo(() => {
    if (page?.hero?.banners && page.hero.banners.length > 0) {
      return page.hero.banners;
    }
    // Fallback if banners array is empty
    if (page?.hero?.bannerImage) {
      return [{
        imageUrl: page.hero.bannerImage,
        title: page.hero.title || '',
        subtitle: page.hero.subtitle || '',
        ctaLink: ''
      }];
    }
    // Deep fallback to category
    if (category?.image) {
      return [{
        imageUrl: category.image,
        title: category.name || '',
        subtitle: category.description || '',
        ctaLink: ''
      }];
    }
    return [];
  }, [page, category]);

  const currentBanner = banners[currentBannerIndex];
  const heroBanner = currentBanner?.imageUrl || '';

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    // Only reset if it's a new image URL, otherwise keep the current load state
    // to avoid flickering or disappearing artifacts on carousel transitions.
    setHeroImageFailed(false);
  }, [heroBanner]);


  if (redirectToProducts) {
    return <Navigate to={`/category/${encodeURIComponent(slug)}/products`} replace />;
  }

  if (loading && (!data || !isCurrentCategoryData)) {
    return <CategoryLandingSkeleton />;
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-[#f7fbf7] px-4 py-10 dark:bg-black">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_25px_80px_rgba(15,23,42,0.08)] dark:bg-[#101010]">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Category page unavailable</h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            The curated page could not be loaded right now. You can still browse the products list for this category.
          </p>
          <button
            onClick={() => navigate(`/category/${encodeURIComponent(slug)}/products`)}
            className="mt-6 rounded-full bg-[#0c831f] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            Open Products
          </button>
        </div>
      </div>
    );
  }

  const hasViewMoreSection = (page.sections || []).some((section) => section.type === 'view_more_cta');

  return (
    <div
      className="category-landing-page min-h-screen pb-28 transition-colors duration-300 dark:bg-black w-full max-w-full"
      style={{
        background: theme.pageBg,
        '--category-page-bg': theme.pageBg,
        '--category-hero-bg': theme.heroBg,
        '--category-card-bg': theme.cardBg,
        '--category-accent': theme.accent,
        '--category-text': theme.text
      }}
    >
      <SEO
        title={page.seo?.title || category?.name || 'Category'}
        description={page.seo?.description || category?.description || `Explore ${category?.name || 'products'} on SaathiGro`}
        image={page.seo?.image || heroBanner || category?.image}
      />

      <div className="category-landing-shell mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="category-landing-topbar mb-3" style={{ position: 'relative', zIndex: 10 }}>
          <div className="category-landing-topbar-row flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/category')}
              className="category-landing-topbar-btn flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all active:scale-90 dark:bg-white/10 dark:text-white"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setIsSearchOverlayOpen(true)}
              className="category-landing-topbar-btn flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all active:scale-90 dark:bg-white/10 dark:text-white"
            >
              <Search size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div
          className="category-landing-hero relative overflow-hidden rounded-[28px] border border-white/60 shadow-[0_25px_70px_rgba(12,131,31,0.12)] dark:border-white/10 sm:rounded-[34px]"
          style={{
            background: isDarkMode 
              ? `linear-gradient(135deg, ${theme.heroBg}, #000000)` 
              : `linear-gradient(135deg, ${theme.heroBg}, #ffffff)`,
            height: banners.length > 0 ? 'auto' : '110px',
            minHeight: '110px'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBannerIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <div
                className="category-landing-hero-inner relative px-4 py-2 sm:px-8 sm:py-4 flex flex-col justify-center min-h-[110px] cursor-pointer"
                onClick={() => banners[currentBannerIndex]?.ctaLink && navigate(banners[currentBannerIndex].ctaLink)}
              >
                {currentBanner?.imageUrl && !heroImageFailed && (
                  <>
                    <img
                      src={currentBanner.imageUrl}
                      alt={currentBanner.title || page.hero?.title || category?.name || 'Category banner'}
                      className={`category-landing-hero-media absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${heroImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                      loading="eager"
                      fetchPriority="high"
                      onLoad={() => setHeroImageLoaded(true)}
                      onError={() => {
                        setHeroImageFailed(true);
                        setHeroImageLoaded(true);
                      }}
                    />
                    <div className="category-landing-hero-overlay absolute inset-0 bg-black/10 dark:bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-black/80 dark:via-black/30 dark:to-transparent" />
                  </>
                )}

                <div className="category-landing-hero-content relative z-10 max-w-sm sm:max-w-md">
                  <div className="category-landing-overline text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
                    SaathiGro {category?.name || 'Category'}
                  </div>
                  <h1 className={`category-landing-title mt-2 text-3xl font-black uppercase tracking-tight sm:mt-3 sm:text-5xl ${isDarkMode ? 'text-white' : 'text-[#0e2b57]'}`}>
                    {banners[currentBannerIndex]?.title || page.hero?.title || category?.name}
                  </h1>
                  {(banners[currentBannerIndex]?.subtitle || page.hero?.subtitle || category?.description) && (
                    <p className="category-landing-hero-copy mt-2 text-[12px] font-medium text-gray-600 dark:text-gray-300 sm:mt-3 sm:text-sm">
                      {banners[currentBannerIndex]?.subtitle || page.hero?.subtitle || category?.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBannerIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentBannerIndex === idx ? 'w-6 bg-[#0c831f]' : 'w-1.5 bg-gray-300'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {page.hero?.sponsorBrand && (
          <div
            className="category-landing-sponsor mt-3 rounded-[22px] border border-[#dceadf] px-4 py-3 shadow-sm dark:border-white/10 sm:mt-4 sm:rounded-[28px] sm:px-5 sm:py-4 transition-colors"
            style={{ backgroundColor: theme.cardBg }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                {page.hero?.sponsorLabel || 'Powered by'}
              </div>
              <button
                onClick={() => navigate(`/brand/${encodeURIComponent(page.hero.sponsorBrand.name)}`)}
                className="flex min-w-0 items-center gap-2.5 sm:gap-3"
              >
                {page.hero.sponsorBrand.logo ? (
                  <img src={page.hero.sponsorBrand.logo} alt={page.hero.sponsorBrand.name} className="h-9 w-9 rounded-xl object-contain sm:h-10 sm:w-10" />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-black text-white sm:h-10 sm:w-10"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {page.hero.sponsorBrand.name?.slice(0, 2)?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 text-left">
                  <div className="truncate text-[13px] font-black text-gray-900 dark:text-white sm:text-sm">
                    {page.hero.sponsorBrand.name}
                  </div>
                  {page.hero.sponsorBrand.description && (
                    <div className="truncate text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">
                      {page.hero.sponsorBrand.description}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="category-landing-sections mt-5 space-y-5 sm:mt-6 sm:space-y-7">
          {(page.sections || []).map((section) => (
            <CategorySectionRenderer
              key={section._id || section.key}
              categorySlug={category.slug || slug}
              section={section}
              theme={theme}
            />
          ))}

          {!hasViewMoreSection && (
            <section className="category-landing-section">
              <button
                onClick={() => navigate(`/category/${encodeURIComponent(category.slug || slug)}/products`)}
                className="category-landing-cta flex w-full items-center justify-center gap-3 rounded-[24px] border border-[#dceadf] bg-white px-5 py-4 text-base font-black shadow-sm dark:border-white/10 dark:bg-[#111111] transition-colors"
                style={{ color: theme.accent, backgroundColor: isDarkMode ? '#111111' : '#ffffff' }}
              >
                <span>View more products</span>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage;
