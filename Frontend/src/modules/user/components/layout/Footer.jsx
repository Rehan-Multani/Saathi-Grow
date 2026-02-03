import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] pt-8 md:pt-16 pb-20 md:pb-0 font-sans transition-colors duration-300 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Useful Links Section */}
          <div className="lg:w-1/3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Useful Links</h3>
            <div className="grid grid-cols-3 w-full gap-x-4 md:gap-x-8">
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">About</Link></li>
                <li><Link to="/careers" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Blog</Link></li>
                <li><Link to="/press" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Press</Link></li>
                <li><Link to="/lead" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Lead</Link></li>
                <li><Link to="/value" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Value</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Terms</Link></li>
                <li><Link to="/faqs" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">FAQs</Link></li>
                <li><Link to="/security" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Security</Link></li>
                <li><Link to="/mobile" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Mobile</Link></li>
                <li><Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Contact</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="/partner" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Partner</Link></li>
                <li><Link to="/express" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Express</Link></li>
                <li><Link to="/seller" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Seller</Link></li>
                <li><Link to="/warehouse" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Warehouse</Link></li>
                <li><Link to="/deliver" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Deliver</Link></li>
                <li><Link to="/resources" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm transition-colors">Resources</Link></li>
              </ul>
            </div>
          </div>

          {/* Categories Section */}
          <div className="lg:w-2/3">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-gray-100">Categories</h3>
              <Link to="/category" className="text-[#0c831f] dark:text-[#10b981] text-sm md:text-base font-black hover:opacity-80 transition-all underline underline-offset-4 decoration-2">see all</Link>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-2">
              <Link to="/category/vegetables-fruits" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Vegetables & Fruits</Link>
              <Link to="/category/dairy-breakfast" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Dairy & Breakfast</Link>
              <Link to="/category/munchies" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Munchies</Link>
              <Link to="/category/cold-drinks-juices" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Cold Drinks & Juices</Link>
              <Link to="/category/instant-frozen-food" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Instant & Frozen Food</Link>
              <Link to="/category/tea-coffee-health-drinks" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Tea, Coffee & Health Drinks</Link>
              <Link to="/category/bakery-biscuits" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Bakery & Biscuits</Link>
              <Link to="/category/atta-rice-dal" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Atta, Rice & Dal</Link>
              <Link to="/category/cleaning-household" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Cleaning Essentials</Link>
              <Link to="/category/personal-care" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Personal Care</Link>
              <Link to="/category/sauces-spreads" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Sauces & Spreads</Link>
              <Link to="/category/chicken-meat-fish" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Chicken, Meat & Fish</Link>
              <Link to="/category/paan-corner" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Paan Corner</Link>
              <Link to="/category/pet-care" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Pet Care</Link>
              <Link to="/category/beauty-cosmetics" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Beauty & Cosmetics</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 dark:bg-[#141414] border-t border-gray-100 dark:border-white/5 py-6 mb-[50px] md:mb-0 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-sm text-center md:text-left">
            © SaathiGro Technologies Pvt. Ltd, 2024-{new Date().getFullYear()}
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-gray-700 dark:text-gray-300 font-bold text-xs md:text-sm">Download App</span>
            <div className="flex gap-2 md:gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Get it on Google Play" className="h-7 md:h-9 cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="Download on the App Store" className="h-7 md:h-9 cursor-pointer" />
            </div>
            <div className="flex gap-3 md:gap-4 mt-2 md:mt-0">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 dark:bg-white/5 text-white flex items-center justify-center hover:bg-[#0c831f] dark:hover:bg-[#0c831f] transition-all border border-transparent dark:border-white/5 hover:scale-110 active:scale-95">
                <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 dark:bg-white/5 text-white flex items-center justify-center hover:bg-[#0c831f] dark:hover:bg-[#0c831f] transition-all border border-transparent dark:border-white/5 hover:scale-110 active:scale-95">
                <Twitter size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 dark:bg-white/5 text-white flex items-center justify-center hover:bg-[#0c831f] dark:hover:bg-[#0c831f] transition-all border border-transparent dark:border-white/5 hover:scale-110 active:scale-95">
                <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
