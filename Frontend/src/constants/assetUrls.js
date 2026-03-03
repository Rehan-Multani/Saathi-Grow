const CLOUDINARY_BASE = "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452867/saathigro/assets";

export const ASSET_URLS = {
  bike: "/assets/delivery-bike.png",
  store: "/assets/store.png",
  house: "/assets/house.png",
  logo: "/assets/logo.png",
  banner: "/assets/banner_new.png",
  placeholder: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452874/saathigro/assets/category-placeholder.png",

  // Cloudinary Fallbacks
  bikeCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452867/saathigro/assets/delivery-bike.png",
  storeCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452868/saathigro/assets/store.png",
  houseCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452869/saathigro/assets/house.png",
  logoCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772455303/saathigro/assets/logo.png",
  bannerCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452872/saathigro/assets/banner_new.png",
  placeholderCloudinary: "https://res.cloudinary.com/dntvxv9ef/raw/upload/v1772452874/saathigro/assets/category-placeholder.png"
};

export const getAssetUrl = (key) => {
  // Return primary asset URL. Error handling should be done at the <img> tag level.
  return ASSET_URLS[key];
};

export const getCloudinaryFallback = (key) => {
  return ASSET_URLS[`${key}Cloudinary`];
};
