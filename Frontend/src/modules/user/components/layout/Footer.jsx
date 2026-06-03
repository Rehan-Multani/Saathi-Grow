import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { getPoliciesList } from '../../../../common/utils/legalUtils';
import logo from '../../../../assets/logo.png';
import { useShop } from '../../context/ShopContext';

const Footer = ({ customTheme }) => {
  const [policies, setPolicies] = useState([]);
  const { categories, settings } = useShop();

  useEffect(() => {
    const fetchPolicies = async () => {
      const data = await getPoliciesList('User');
      setPolicies(data);
    };
    fetchPolicies();
  }, []);

  return (
    <footer
      className="pt-4 md:pt-16 pb-12 md:pb-12 font-sans transition-colors duration-300 border-t border-white/10 relative bg-black text-white"
      style={{
        background: customTheme
          ? `linear-gradient(to right, ${customTheme.bgColor}, #000000)`
          : '#000000'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-row justify-between items-start gap-1 sm:gap-4 mb-4 sm:mb-12">

          {/* Brand Section */}
          <div className="flex flex-col items-start text-left min-w-fit">
            <Link to="/" className="mb-2 sm:mb-4 inline-block bg-white/5 p-2 rounded-xl backdrop-blur-sm">
              <img src={logo} alt="sathiGro" className="h-8 sm:h-12 object-contain" />
            </Link>
            <p className="text-gray-400 text-xs leading-relaxed max-w-[100px] hidden lg:block">
              Fresh groceries delivered to your home in minutes.
            </p>
          </div>

          {/* Most Wanted Category Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[9px] sm:text-sm font-bold text-white mb-2 sm:mb-5">Categories</h3>
            <ul className="space-y-2 sm:space-y-3 p-0 list-none">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id || cat.id}>
                    <Link
                      to={`/category/${encodeURIComponent(cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/category/fruit-and-vegetables" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Fruits</Link></li>
                  <li><Link to="/category/dairy-egg-frozen" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Dairy</Link></li>
                  <li><Link to="/category/snacks-bakery" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Snacks</Link></li>
                  <li><Link to="/category/staples-and-grains" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Grains</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Essential Links Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[9px] sm:text-sm font-bold text-white mb-2 sm:mb-5">Resources</h3>
            <ul className="space-y-2 sm:space-y-3 p-0 list-none">
              <li><Link to="/help" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Help Center</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">Contact</Link></li>
              {policies.map(p => (
                <li key={p._id}>
                  <Link to={`/legal/${p.slug}`} className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-sm transition-colors">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & App Section */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[9px] sm:text-sm font-bold text-white mb-2 sm:mb-5">Connect</h3>
            {(settings?.facebookUrl || settings?.twitterUrl || settings?.instagramUrl || settings?.linkedinUrl) && (
            <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-3">
              {settings?.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#0c831f] hover:text-white transition-all">
                  <Facebook size={12} className="sm:w-4 sm:h-4" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#0c831f] hover:text-white transition-all">
                  <Twitter size={12} className="sm:w-4 sm:h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#0c831f] hover:text-white transition-all">
                  <Instagram size={12} className="sm:w-4 sm:h-4" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-[#0c831f] hover:text-white transition-all">
                  <Linkedin size={12} className="sm:w-4 sm:h-4" />
                </a>
              )}
            </div>
            )}
            <div className="flex flex-col gap-1">
              {settings?.supportPhone && (
                <a href={`tel:${settings.supportPhone}`} className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-xs transition-colors flex items-center gap-1">
                  <span className="font-bold opacity-60">P:</span> {settings.supportPhone}
                </a>
              )}
              {settings?.supportEmail && (
                <a href={`mailto:${settings.supportEmail}`} className="text-gray-400 hover:text-[#0c831f] text-[7.5px] sm:text-xs transition-colors flex items-center gap-1">
                  <span className="font-bold opacity-60">E:</span> {settings.supportEmail}
                </a>
              )}
            </div>
            <div className="hidden sm:flex flex-col gap-3 w-full max-w-[140px] mt-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/1024px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-8 cursor-pointer hover:opacity-80 transition-opacity object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/1024px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-8 cursor-pointer hover:opacity-80 transition-opacity object-contain" />
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-1">
          <p className="text-gray-500 text-[8px] md:text-xs font-medium">
             {new Date().getFullYear()} sathiGro Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-gray-500 text-[10px] md:text-xs font-medium">
            <span>Built with</span>
            <span className="text-red-500">❤️</span>
            <span>for sathiGro Users</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

