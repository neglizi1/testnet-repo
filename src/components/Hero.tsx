
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-transparent -z-10" />
      <div className="container mx-auto px-4 pt-16">
        <div className="max-w-3xl mx-auto text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
            Welcome to the future of aura
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            If Aura Was a Currency? Now It Is!
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Creators: Mint your own token easily.<br />
            Fans: Invest, sell & flex your favourite creator Auras.<br />
            All on the Binance Smart Chain Network
          </p>

          <div className="space-y-12">
            {/* Creators Section */}
            <div className="text-left bg-white/50 backdrop-blur-sm p-8 rounded-xl border shadow-sm">
              <h2 className="text-2xl font-bold mb-4">For Creators and businesses 💰</h2>
              <p className="text-gray-600 mb-6">
                Turn Your Aura into a Digital Asset. Create your own token in a few clicks and give your fans 
                a new way to support you, engage with you, and invest in your success.
              </p>
              <Button
                onClick={() => window.location.href = '/create'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Launch Your Token Now <ArrowRight className="ml-2" />
              </Button>
            </div>

            {/* Fans Section */}
            <div className="text-left bg-white/50 backdrop-blur-sm p-8 rounded-xl border shadow-sm">
              <h2 className="text-2xl font-bold mb-4">For Fans & Traders 🚀</h2>
              <p className="text-gray-600 mb-6">
                Trade Creator or Business Tokens & Be Part of Their Journey. Buy, sell, and hold tokens of 
                your favorite creators. Get exclusive perks, early access, and ride the wave of their growth.
              </p>
              <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
                <Input
                  type="text"
                  placeholder="Search by Instagram handle (e.g., @Ye) or Mint Address"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
