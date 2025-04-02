
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, BarChart2, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger
} from '@/components/ui/navigation-menu';

const Navigation = () => {
  console.log("Navigation component rendering");
  
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [bnbInUsd, setBnbInUsd] = useState<number | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize wallet from localStorage on component mount
  useEffect(() => {
    const storedAccount = localStorage.getItem('walletAccount');
    if (storedAccount && window.ethereum) {
      setAccount(storedAccount);
      
      const updateBalance = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balance = await provider.getBalance(storedAccount);
          setBalance(ethers.formatEther(balance));
        } catch (error) {
          console.error('Error getting balance for stored account:', error);
          // If there's an error fetching balance, the stored account might be invalid
          localStorage.removeItem('walletAccount');
          setAccount(null);
        }
      };
      
      updateBalance();
    }
  }, []);

  // Monitor for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccount(null);
          setBalance(null);
          localStorage.removeItem('walletAccount');
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected."
          });
        } else if (accounts[0] !== account) {
          // Account changed, update the state and localStorage
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem('walletAccount', newAccount);
          
          // Update balance
          const updateBalance = async () => {
            try {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const balance = await provider.getBalance(newAccount);
              setBalance(ethers.formatEther(balance));
            } catch (error) {
              console.error('Error getting balance:', error);
            }
          };
          
          updateBalance();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Cleanup listener on unmount
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [account]);

  // Fetch BNB price in USD
  useEffect(() => {
    const fetchBnbPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
        const data = await response.json();
        setBnbInUsd(parseFloat(data.price));
      } catch (error) {
        console.error('Error fetching BNB price:', error);
      }
    };

    fetchBnbPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchBnbPrice, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request accounts access
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        
        const balance = await provider.getBalance(address);
        
        setAccount(address);
        setBalance(ethers.formatEther(balance));
        
        // Store wallet address in localStorage for persistence
        localStorage.setItem('walletAccount', address);
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been successfully connected."
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to your wallet. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        variant: "destructive"
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex flex-col items-center">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/6c87fd67-9d53-4112-a0b8-db6b132f63e9.png" 
                  alt="SponsAura Logo" 
                  className="w-7 h-7 mr-2" 
                />
                <span className="text-lg font-semibold text-foreground">SponsAura</span>
              </div>
              <span className="text-xs text-gray-500">Where your Aura is now Sponsored</span>
            </Link>
            
            {isMobile ? (
              <button onClick={toggleMobileMenu} className="text-gray-600 dark:text-gray-300 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  )}
                </svg>
              </button>
            ) : (
              <div className="hidden md:flex items-center justify-center space-x-2">
                <Link to="/create" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Create Token</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/verify" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Verify Token</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/trade" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Trade Tokens</Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/token" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Token Dashboard</Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <a href="https://twitter.com/sponsaura" target="_blank" rel="noopener noreferrer" className="social-link">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/sponsaura" target="_blank" rel="noopener noreferrer" className="social-link">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <DarkModeToggle />
            {account ? (
              <div className="flex items-center gap-2">
                <Switch 
                  checked={showBalance} 
                  onCheckedChange={setShowBalance}
                  aria-label="Toggle balance visibility" 
                />
                {showBalance && (
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <div>{balance ? `${parseFloat(balance).toFixed(4)} BNB` : 'Loading...'}</div>
                    {balance && bnbInUsd && (
                      <div className="text-xs text-gray-500">
                        ≈ ${(parseFloat(balance) * bnbInUsd).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-800">
            <div className="flex flex-col space-y-3">
              <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Create Token</Link>
              <Link to="/verify" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Verify Token</Link>
              <Link to="/trade" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Trade Tokens</Link>
              <Link to="/token" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors px-3 py-2 text-sm">Token Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
