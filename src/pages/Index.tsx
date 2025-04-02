
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Coins, ChartBar, Shield, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-8 pb-16 md:pt-16">
        <section className="max-w-5xl mx-auto py-8 md:py-16 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Create Your Own Social Token with SponsAura
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
            Launch your personalized token on the Binance Smart Chain and allow your fans to support you while investing in your growth
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            <Link to="/create" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6">
                Create Token <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/trade" className="flex-1">
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-6">
                Trade Tokens <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
        
        <section className="max-w-6xl mx-auto py-8 md:py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-16">How SponsAura Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex flex-col items-center text-center p-4 md:p-6 glass-card">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-4">
                <Coins className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Create Your Token</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Design your custom token with your brand name and set a migration threshold that works for your community
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 md:p-6 glass-card">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-4">
                <ChartBar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Grow Your Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share your token with fans and supporters who can trade and contribute to reaching your migration threshold
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-4 md:p-6 glass-card">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 mb-4">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Earn Rewards</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get a 5% reward when your token migrates to PancakeSwap, plus earn 1% on every trade fans make
              </p>
            </div>
          </div>
        </section>
        
        <section className="max-w-4xl mx-auto py-8 md:py-16">
          <div className="glass-card p-6 md:p-12">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Verify Your Token</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Get your token verified with @SponsAura on Instagram or Twitter/X to increase visibility and trust
              </p>
              <Link to="/verify">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-6 md:px-8 py-4 md:py-6">
                  Verify Your Token
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
