import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--saathi-green)] rounded-lg flex items-center justify-center">
                <span className="text-[var(--saathi-yellow)] font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-[var(--saathi-green)] tracking-tight">
                Saathi<span className="text-[var(--saathi-green)]">Gro</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-xs mx-auto md:mx-0">
              Your neighborhood smart grocery assistant. Delivering happiness and fresh essentials in minutes.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[var(--saathi-green)] hover:text-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[var(--saathi-green)] hover:text-white transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[var(--saathi-green)] hover:text-white transition-colors">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Careers</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Blog</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Press</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Help Center</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-[var(--saathi-green)] text-sm transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-500 justify-center md:justify-start text-left">
                <MapPin size={18} className="text-[var(--saathi-green)] shrink-0 mt-0.5" />
                <span>123, Tech Park, Sector 5, Salt Lake, Kolkata, West Bengal - 700091</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 justify-center md:justify-start">
                <Phone size={18} className="text-[var(--saathi-green)] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500 justify-center md:justify-start">
                <Mail size={18} className="text-[var(--saathi-green)] shrink-0" />
                <span>support@saathigro.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SaathiGro. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Play Store" className="h-8" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
