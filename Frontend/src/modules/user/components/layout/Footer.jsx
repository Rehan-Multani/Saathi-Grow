import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-8 md:pt-16 pb-20 md:pb-0 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Useful Links Section */}
          <div className="lg:w-1/3">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Useful Links</h3>
            <div className="grid grid-cols-3 w-full gap-x-4 md:gap-x-8">
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">About</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Careers</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Blog</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Press</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Lead</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Value</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Privacy</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Terms</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">FAQs</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Security</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Mobile</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Contact</Link></li>
              </ul>
              <ul className="space-y-1 p-0 list-none">
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Partner</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Express</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Seller</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Warehouse</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Deliver</Link></li>
                <li><Link to="#" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm">Resources</Link></li>
              </ul>
            </div>
          </div>

          {/* Categories Section */}
          <div className="lg:w-2/3">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-base md:text-lg font-bold text-gray-900">Categories</h3>
              <Link to="/category" className="!text-[#0c831f] text-sm md:text-base font-normal">see all</Link>
            </div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 md:gap-x-4 md:gap-y-2">
              <Link to="/category/vegetables-fruits" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Vegetables & Fruits</Link>
              <Link to="/category/dairy-breakfast" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Dairy & Breakfast</Link>
              <Link to="/category/munchies" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Munchies</Link>
              <Link to="/category/cold-drinks-juices" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Cold Drinks & Juices</Link>
              <Link to="/category/instant-frozen-food" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Instant & Frozen Food</Link>
              <Link to="/category/tea-coffee-health-drinks" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Tea, Coffee & Health Drinks</Link>
              <Link to="/category/bakery-biscuits" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Bakery & Biscuits</Link>
              <Link to="/category/atta-rice-dal" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Atta, Rice & Dal</Link>
              <Link to="/category/cleaning-household" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Cleaning Essentials</Link>
              <Link to="/category/personal-care" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Personal Care</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Sauces & Spreads</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Chicken, Meat & Fish</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Paan Corner</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Baby Care</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Pharma & Wellness</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Home Furnishing & Decor</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Pet Care</Link>
              <Link to="/category" className="!text-gray-500 hover:text-gray-900 text-xs md:text-sm truncate">Beauty & Cosmetics</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-50 border-t border-gray-100 py-6 mb-[50px] md:mb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-[10px] md:text-sm text-center md:text-left">
            © SaathiGro Technologies Pvt. Ltd, 2024-{new Date().getFullYear()}
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <span className="text-gray-700 font-bold text-xs md:text-sm">Download App</span>
            <div className="flex gap-2 md:gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Get it on Google Play" className="h-7 md:h-9 cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="Download on the App Store" className="h-7 md:h-9 cursor-pointer" />
            </div>
            <div className="flex gap-3 md:gap-4 mt-2 md:mt-0">
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Twitter size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Instagram size={16} className="md:w-[18px] md:h-[18px]" />
              </a>
              <a href="#" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
                <div className="font-bold text-xs md:text-sm">in</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
