
import React, { useEffect, useState } from 'react';
import { ArrowDownUp, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SlippageSettings from './SlippageSettings';
import { ethers } from 'ethers';

interface TokenInfo {
  address: string;
  symbol: string;
  name?: string;
  threshold?: string;
  virtualBNB?: string;
  virtualTokens?: string;
}

interface TokenSwapCardProps {
  slippage: string;
  setSlippage: (value: string) => void;
  selectedToken: TokenInfo | null;
  amount: string;
  setAmount: (amount: string) => void;
  isBuying: boolean;
  isTrading: boolean;
  handleSwapMode: () => void;
  handleSwap: () => void;
  estimatedReceiveAmount: string;
  bnbBalance: string;
  tokenBalance: string;
}

const TokenSwapCard = ({
  slippage,
  setSlippage,
  selectedToken,
  amount,
  setAmount,
  isBuying,
  isTrading,
  handleSwapMode,
  handleSwap,
  estimatedReceiveAmount,
  bnbBalance,
  tokenBalance,
}: TokenSwapCardProps) => {
  // Ensure input is a valid number
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Check if amount exceeds balance
  const exceedsBalance = () => {
    if (!amount || amount === '0') return false;
    
    const numAmount = parseFloat(amount);
    if (isBuying) {
      return numAmount > parseFloat(bnbBalance || '0');
    } else {
      return numAmount > parseFloat(tokenBalance || '0');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Swap</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SlippageSettings slippage={slippage} setSlippage={setSlippage} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* From Token */}
        <div className="bg-secondary p-4 rounded-lg mb-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">From</span>
            <span className="text-sm text-muted-foreground">
              Balance: {isBuying ? bnbBalance || '0.00' : tokenBalance || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <Input 
              type="text" 
              placeholder="0.0" 
              value={amount}
              onChange={handleAmountChange}
              className="border-none bg-transparent text-xl p-0 h-auto focus-visible:ring-0"
            />
            <div className="bg-background border rounded-lg px-3 py-1 font-medium">
              {isBuying ? "BNB" : selectedToken ? selectedToken.symbol : "Token"}
            </div>
          </div>
          {exceedsBalance() && (
            <p className="text-destructive text-sm mt-1">
              Exceeds your balance
            </p>
          )}
        </div>
        
        {/* Swap Direction Button */}
        <div className="flex justify-center my-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSwapMode}
            className="bg-background border rounded-full h-8 w-8"
          >
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>
        
        {/* To Token */}
        <div className="bg-secondary p-4 rounded-lg mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">To (Estimated)</span>
            <span className="text-sm text-muted-foreground">
              Balance: {!isBuying ? bnbBalance || '0.00' : tokenBalance || '0.00'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <Input 
              type="text" 
              placeholder="0.0" 
              disabled
              value={estimatedReceiveAmount}
              className="border-none bg-transparent text-xl p-0 h-auto focus-visible:ring-0"
            />
            <div className="bg-background border rounded-lg px-3 py-1 font-medium">
              {isBuying ? selectedToken ? selectedToken.symbol : "Token" : "BNB"}
            </div>
          </div>
        </div>
        
        {/* Slippage notice */}
        <div className="text-xs text-muted-foreground mb-4">
          <p>Slippage Tolerance: {slippage}%</p>
          <p>Note: Output is estimated. You may receive approximately {slippage}% less due to slippage.</p>
        </div>
        
        {/* Swap Button */}
        <Button 
          className="w-full" 
          size="lg"
          disabled={!selectedToken || !amount || amount === '0' || isTrading || exceedsBalance()}
          onClick={handleSwap}
        >
          {isTrading 
            ? "Processing..." 
            : !selectedToken 
              ? "Select a token first" 
              : !amount || amount === '0'
                ? "Enter an amount" 
                : exceedsBalance()
                  ? "Insufficient balance"
                  : isBuying 
                    ? `Buy ${selectedToken.symbol}` 
                    : `Sell ${selectedToken.symbol}`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TokenSwapCard;
