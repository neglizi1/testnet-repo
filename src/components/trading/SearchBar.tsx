
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ethers } from 'ethers';

interface TokenInfo {
  address: string;
  symbol: string;
  name?: string;
  threshold?: string;
  virtualBNB?: string;
  virtualTokens?: string;
}

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  tokenDetails: TokenInfo | null;
  isLoading: boolean;
}

const SearchBar = ({ searchQuery, setSearchQuery, handleSearch, tokenDetails, isLoading }: SearchBarProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search by inputting the token address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={!tokenDetails || isLoading}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading && searchQuery && ethers.isAddress(searchQuery) && (
          <div className="mt-4 p-3 bg-secondary rounded-md">
            <p className="text-sm">Searching for token details...</p>
          </div>
        )}
        
        {tokenDetails && (
          <div className="mt-4 p-3 bg-secondary rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{tokenDetails.name || 'Unknown Token'}</h3>
                <p className="text-sm text-muted-foreground">Symbol: {tokenDetails.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Threshold: {tokenDetails.threshold} BNB</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {tokenDetails.address.substring(0, 8)}...{tokenDetails.address.substring(tokenDetails.address.length - 6)}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={handleSearch}
            >
              Select this token
            </Button>
          </div>
        )}
        
        {searchQuery && ethers.isAddress(searchQuery) && !tokenDetails && !isLoading && (
          <div className="mt-4 p-3 bg-secondary rounded-md">
            <p className="text-sm text-muted-foreground">No token found at this address.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchBar;
