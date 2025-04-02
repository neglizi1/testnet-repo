
import React from 'react';
import { Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between py-4">
          <div className="flex flex-col items-center mb-4 md:mb-0">
            <div className="text-lg font-semibold">SponsAura</div>
            <div className="text-xs text-muted-foreground">Where your Aura is now Sponsored</div>
          </div>
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <a 
              href="https://twitter.com/sponsaura" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link flex items-center space-x-1"
            >
              <Twitter className="h-4 w-4" />
              <span>@SponsAura</span>
            </a>
            <a 
              href="https://instagram.com/sponsaura" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link flex items-center space-x-1"
            >
              <Instagram className="h-4 w-4" />
              <span>@SponsAura</span>
            </a>
          </div>
          <div className="text-muted-foreground">
            <a href="mailto:support@sponsaura.com">support@sponsaura.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
