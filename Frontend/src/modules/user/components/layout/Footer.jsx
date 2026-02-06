import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] pt-8 md:pt-16 pb-24 md:pb-0 font-sans transition-colors duration-300 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Useful Links Section */}
          <div className="lg:w-1/3 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h3 className="text-[13px] md:text-lg font-black text-gray-900 dark:text-gray-100 mb-5 md:mb-6 tracking-widest">Useful links</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 md:gap-x-6 lg:gap-x-8 gap-y-3 justify-items-center lg:justify-items-start">
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">About</Link></li>
                <li><Link to="/careers" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Blog</Link></li>
                <li><Link to="/press" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Press</Link></li>
                <li><Link to="/lead" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Lead</Link></li>
                <li><Link to="/value" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Value</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Terms</Link></li>
                <li><Link to="/faqs" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">FAQs</Link></li>
                <li><Link to="/security" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Security</Link></li>
                <li><Link to="/mobile" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Mobile</Link></li>
                <li><Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Contact</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none hidden sm:block">
                <li><Link to="/partner" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Partner</Link></li>
                <li><Link to="/express" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Express</Link></li>
                <li><Link to="/seller" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Seller</Link></li>
                <li><Link to="/warehouse" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Warehouse</Link></li>
                <li><Link to="/deliver" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Deliver</Link></li>
                <li><Link to="/resources" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-[10px] md:text-sm transition-colors">Resources</Link></li>
              </ul>
            </div>
          </div>

          {/* Categories Section */}
          <div className="lg:w-2/3 text-center lg:text-left flex flex-col items-center lg:items-start mt-10 lg:mt-0">
            <div className="flex items-center gap-4 mb-5 md:mb-6 justify-center lg:justify-start">
              <h3 className="text-[13px] md:text-xl font-black text-gray-900 dark:text-gray-100 tracking-widest">Categories</h3>
              <Link to="/category" className="text-[#0c831f] text-[10px] md:text-sm font-black hover:opacity-80 transition-all border-b border-[#0c831f] pb-0.5">See all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 md:gap-x-12 md:gap-y-4 justify-items-center lg:justify-items-start">
              <Link to="/category/fruit-and-vegetables" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Vegetables & Fruits</Link>
              <Link to="/category/dairy-egg-frozen" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Dairy & Breakfast</Link>
              <Link to="/category/snacks-bakery" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Munchies</Link>
              <Link to="/category/food-beverage" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Cold Drinks & Juices</Link>
              <Link to="/category/staples-and-grains" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Atta, Rice & Dal</Link>
              <Link to="/category/masala-and-spices" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Masala & Spices</Link>
              <Link to="/category/oil-and-ghee" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Oil & Ghee</Link>
              <Link to="/category/cleaning-essentials" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Cleaning Essentials</Link>
              <Link to="/category/personal-care" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Personal Care</Link>
              <Link to="/category/chocolate-sweet" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Chocolate & Sweet</Link>
              <Link to="/category/dry-fruit" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Dry Fruits</Link>
              <Link to="/category/home-office" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Home & Office</Link>
              <Link to="/category/pet-care" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Pet Care</Link>
              <Link to="/category/beauty-grooming" className="text-gray-500 dark:text-gray-400 hover:!text-[#0c831f] dark:hover:!text-[#10b981] text-xs md:text-sm truncate transition-colors">Beauty & Grooming</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#f8f9fa] dark:bg-[#111] border-t border-gray-100 dark:border-white/5 py-8 pb-32 md:pb-8 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-gray-500 dark:text-gray-400 text-[11px] md:text-sm font-medium">
              © SaathiGro Technologies Pvt. Ltd, 2024-{new Date().getFullYear()}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 md:hidden">Made with ❤️ for SaathiGro Users</p>
          </div>

          <div className="flex flex-col items-center gap-6 md:gap-8 w-full md:w-auto">
            <div className="flex flex-col items-center md:items-start gap-3">
              <span className="text-gray-800 dark:text-gray-200 font-black text-[10px] uppercase tracking-widest">Download App</span>
              <div className="flex gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-8 md:h-10 cursor-pointer hover:opacity-80 transition-opacity" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-8 md:h-10 cursor-pointer hover:opacity-80 transition-opacity" />
              </div>
            </div>

            <div className="flex gap-5">
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#0c831f] hover:text-white transition-all shadow-sm border border-gray-100 dark:border-white/5">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#0c831f] hover:text-white transition-all shadow-sm border border-gray-100 dark:border-white/5">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-[#0c831f] hover:text-white transition-all shadow-sm border border-gray-100 dark:border-white/5">
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
