import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] md:bg-none md:bg-white dark:from-[#141414] dark:to-[#141414] md:dark:bg-black pt-4 md:pt-16 pb-12 md:pb-12 font-sans transition-colors duration-300 border-t border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-between items-start gap-1 sm:gap-4 mb-4 sm:mb-12">

          {/* Brand Section */}
          <div className="flex flex-col items-start text-left min-w-fit">
            <Link to="/" className="text-[9px] sm:text-2xl font-black text-[#0c831f] tracking-tighter mb-2 sm:mb-4">SaathiGro</Link>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed max-w-[100px] hidden lg:block">
              Fresh groceries delivered to your home in minutes.
            </p>
          </div>

          {/* Most Wanted Category Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[5.5px] sm:text-[11px] font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-5">Categories</h3>
            <ul className="space-y-2 sm:space-y-3 p-0 list-none">
              <li><Link to="/category/fruit-and-vegetables" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Fruits</Link></li>
              <li><Link to="/category/dairy-egg-frozen" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Dairy</Link></li>
              <li><Link to="/category/snacks-bakery" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Snacks</Link></li>
              <li><Link to="/category/staples-and-grains" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Grains</Link></li>
            </ul>
          </div>

          {/* Essential Links Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[5.5px] sm:text-[11px] font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-5">Resources</h3>
            <ul className="space-y-2 sm:space-y-3 p-0 list-none">
              <li><Link to="/about" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Contact</Link></li>
              <li><Link to="/faqs" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">FAQs</Link></li>
              <li><Link to="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Social & App Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[5.5px] sm:text-[11px] font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-5">Connect</h3>
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-8">
              <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-[#0c831f] hover:bg-[#0c831f] hover:text-white transition-all"><Facebook size={12} className="sm:w-4 sm:h-4" /></a>
              <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-[#0c831f] hover:bg-[#0c831f] hover:text-white transition-all"><Twitter size={12} className="sm:w-4 sm:h-4" /></a>
              <a href="#" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-[#0c831f] hover:bg-[#0c831f] hover:text-white transition-all"><Instagram size={12} className="sm:w-4 sm:h-4" /></a>
            </div>
            <div className="hidden sm:flex flex-col gap-3 w-full max-w-[140px]">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/1024px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-8 cursor-pointer hover:opacity-80 transition-opacity object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/1024px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-8 cursor-pointer hover:opacity-80 transition-opacity object-contain" />
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-1">
          <p className="text-gray-400 dark:text-gray-500 text-[8px] md:text-xs font-medium">
            © {new Date().getFullYear()} SaathiGro Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[10px] md:text-xs font-medium">
            <span>Built with</span>
            <span className="text-red-500">❤️</span>
            <span>for SaathiGro Users</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
