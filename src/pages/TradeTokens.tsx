import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { tradeTokens, getContractInstance, claimCreatorFees, getCreatorFees } from '@/utils/contractUtils';
import { useToast } from '@/hooks/use-toast';
import SearchBar from '@/components/trading/SearchBar';
import TokenSwapCard from '@/components/trading/TokenSwapCard';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Coins, TrendingUp, AlertTriangle } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';

interface TokenInfo {
  tokenAddress: string;
  symbol: string;
  name?: string;
  threshold?: string;
  VBNB?: string;
  VTOK?: string;
  migrated?: boolean;
  creator?: string;
}

const TradeTokens = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [slippage, setSlippage] = useState('5.0'); // Default to 5%
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [tokenDetails, setTokenDetails] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [isBuying, setIsBuying] = useState(true);
  const [isTrading, setIsTrading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState('0');
  const [bnbBalance, setBnbBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [isClaimingFees, setIsClaimingFees] = useState(false);
  const [creatorFees, setCreatorFees] = useState('0');
  const [isCreator, setIsCreator] = useState(false);
  const [bnbUsdPrice, setBnbUsdPrice] = useState<number | null>(null);
  const { toast } = useToast();

  // Parse token from URL if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl && ethers.isAddress(tokenFromUrl)) {
      setSearchQuery(tokenFromUrl);
    }
  }, [location]);

  // Fetch BNB price in USD
  useEffect(() => {
    const fetchBnbPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
        const data = await response.json();
        setBnbUsdPrice(parseFloat(data.price));
      } catch (error) {
        console.error('Error fetching BNB price:', error);
      }
    };
    fetchBnbPrice();
    const interval = setInterval(fetchBnbPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch token details when search query changes
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (searchQuery && ethers.isAddress(searchQuery)) {
        setIsLoading(true);
        try {
          const contract = await getContractInstance();
          const tokenOnChain: TokenInfo = await contract.tokens(searchQuery);
          if (tokenOnChain && tokenOnChain.tokenAddress !== ethers.ZeroAddress) {
            // Check migration status
            const migrationStatus = tokenOnChain.migrated;
            console.log("Token migration status from contract:", migrationStatus);

            // Create ERC20 interface to get token name and symbol
            const erc20Interface = new ethers.Interface([
              "function name() view returns (string)",
              "function symbol() view returns (string)",
              "function balanceOf(address) view returns (uint256)"
            ]);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const tokenContract = new ethers.Contract(tokenOnChain.tokenAddress, erc20Interface, provider);
            let name = "Unknown";
            let symbol = "???";
            try {
              name = await tokenContract.name();
              symbol = await tokenContract.symbol();
              // Get token balance for connected wallet
              const accounts = await provider.listAccounts();
              if (accounts.length > 0) {
                const balance = await tokenContract.balanceOf(accounts[0].address);
                setTokenBalance(ethers.formatEther(balance));
                const bnbBal = await provider.getBalance(accounts[0].address);
                setBnbBalance(ethers.formatEther(bnbBal));
                // Check if current user is the creator
                const creatorAddr = tokenOnChain.creator.toLowerCase();
                const isUserCreator = accounts[0].address.toLowerCase() === creatorAddr;
                setIsCreator(isUserCreator);
                if (isUserCreator) {
                  const fees = await getCreatorFees(tokenOnChain.tokenAddress);
                  setCreatorFees(fees);
                }
              }
            } catch (error) {
              console.error("Error fetching ERC20 token details:", error);
              symbol = tokenOnChain.tokenAddress.substring(0, 6) + "...";
            }

            // Convert contract values using ethers.formatEther
            const threshold = ethers.formatEther(tokenOnChain.threshold);
            const virtualBNB = ethers.formatEther(tokenOnChain.VBNB);
            const virtualTokens = ethers.formatEther(tokenOnChain.VTOK);
            // Calculate migration progress (using threshold and virtualBNB)
            const thresholdValue = parseFloat(threshold);
            const currentVBNB = parseFloat(virtualBNB);
            const progress = thresholdValue === 0 ? 0 : Math.min(100, (currentVBNB / thresholdValue) * 100);
            setMigrationProgress(progress);

            const details: TokenInfo = {
              tokenAddress: tokenOnChain.tokenAddress,
              symbol: symbol,
              name: name,
              threshold: threshold,
              VBNB: virtualBNB,
              VTOK: virtualTokens,
              creator: tokenOnChain.creator,
              migrated: migrationStatus
            };
            setTokenDetails(details);
          } else {
            setTokenDetails(null);
          }
        } catch (error) {
          console.error("Error checking token:", error);
          setTokenDetails(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setTokenDetails(null);
      }
    };
    fetchTokenDetails();
  }, [searchQuery]);

  // Calculate estimated receive amount
  useEffect(() => {
    const calculateEstimatedAmount = () => {
      if (!selectedToken || !amount || amount === '0') {
        setEstimatedReceiveAmount('0');
        return;
      }
      try {
        const inputAmount = parseFloat(amount);
        let outputAmount = 0;
        if (selectedToken.VBNB && selectedToken.VTOK) {
          const virtualBNB = parseFloat(selectedToken.VBNB);
          const virtualTokens = parseFloat(selectedToken.VTOK);
          if (isBuying) {
            outputAmount = inputAmount * (virtualTokens / virtualBNB);
          } else {
            outputAmount = inputAmount * (virtualBNB / virtualTokens);
          }
        } else {
          outputAmount = isBuying ? inputAmount * 100 : inputAmount / 100;
        }
        const slippageValue = parseFloat(slippage) / 100;
        outputAmount = outputAmount * (1 - slippageValue);
        setEstimatedReceiveAmount(outputAmount.toFixed(6));
      } catch (error) {
        console.error("Error calculating estimated amount:", error);
        setEstimatedReceiveAmount('0');
      }
    };
    calculateEstimatedAmount();
  }, [amount, selectedToken, isBuying, slippage]);

  // Get wallet balances on load and on account changes
  useEffect(() => {
    const getWalletBalances = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const bnbBal = await provider.getBalance(accounts[0].address);
          setBnbBalance(ethers.formatEther(bnbBal));
        }
      } catch (error) {
        console.error("Error getting wallet balances:", error);
      }
    };
    getWalletBalances();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', getWalletBalances);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', getWalletBalances);
      }
    };
  }, []);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    if (tokenDetails) {
      setSelectedToken(tokenDetails);
      // Fetch updated token balance for the selected token
      fetchTokenBalance(tokenDetails.tokenAddress);
      navigate(`/trade?token=${tokenDetails.tokenAddress}`);
    }
  };

  const fetchTokenBalance = async (tokenAddr: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const erc20Interface = new ethers.Interface(["function balanceOf(address) view returns (uint256)"]);
        const tokenContract = new ethers.Contract(tokenAddr, erc20Interface, provider);
        const balance = await tokenContract.balanceOf(accounts[0].address);
        setTokenBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const handleSwapMode = () => {
    setIsBuying(!isBuying);
    setAmount('');
  };

  const handleSwap = async () => {
    if (!selectedToken || !amount) return;
    setIsTrading(true);
    try {
      console.log(`${isBuying ? 'Buying' : 'Selling'} ${amount} ${selectedToken.symbol} with slippage ${slippage}%`);
      const slippageBasisPoints = Math.floor(parseFloat(slippage) * 100);
      await tradeTokens(selectedToken.tokenAddress, amount, isBuying, slippageBasisPoints);
      toast({
        title: "Transaction Successful",
        description: `Successfully ${isBuying ? 'bought' : 'sold'} ${amount} ${selectedToken.symbol}.`,
        variant: "default",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const bnbBal = await provider.getBalance(accounts[0].address);
        setBnbBalance(ethers.formatEther(bnbBal));
        fetchTokenBalance(selectedToken.tokenAddress);
        const contract = await getContractInstance();
        const tokenOnChain: TokenInfo = await contract.tokens(selectedToken.tokenAddress);
        const virtualBNB = ethers.formatEther(tokenOnChain.VBNB);
        const virtualTokens = ethers.formatEther(tokenOnChain.VTOK);
        const threshold = ethers.formatEther(tokenOnChain.threshold);
        const thresholdValue = parseFloat(threshold);
        const currentVBNB = parseFloat(virtualBNB);
        const progress = thresholdValue === 0 ? 0 : Math.min(100, (currentVBNB / thresholdValue) * 100);
        setMigrationProgress(progress);
        setSelectedToken({
          ...selectedToken,
          VBNB: virtualBNB,
          VTOK: virtualTokens
        });
        if (isCreator) {
          const fees = await getCreatorFees(selectedToken.tokenAddress);
          setCreatorFees(fees);
        }
      }
      setAmount('');
    } catch (error) {
      console.error("Trade error:", error);
      let errorMessage = "There was an error processing your trade.";
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds") || error.message.includes("exceeds balance")) {
          errorMessage = "Insufficient balance for this transaction.";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction rejected by user.";
        } else if (error.message.includes("gas")) {
          errorMessage = "Gas estimation failed. The transaction might fail.";
        }
      }
      toast({
        title: "Transaction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleClaimFees = async () => {
    if (!selectedToken) return;
    setIsClaimingFees(true);
    try {
      await claimCreatorFees(selectedToken.tokenAddress);
      toast({
        title: "Fees Claimed",
        description: `Successfully claimed ${creatorFees} BNB in creator fees.`,
      });
      setCreatorFees('0');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const balance = await provider.getBalance(accounts[0].address);
        setBnbBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error("Error claiming fees:", error);
      let errorMessage = "There was an error claiming your fees.";
      if (error instanceof Error && error.message.includes("user rejected")) {
        errorMessage = "Transaction rejected by user.";
      }
      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsClaimingFees(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-center mb-8">Trade Tokens</h1>
        <div className="max-w-6xl mx-auto">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            tokenDetails={tokenDetails}
            isLoading={isLoading}
          />
          {selectedToken && selectedToken.migrated && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300">This token has been migrated</h3>
                  <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                    Please visit PancakeSwap to trade this token.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-amber-600 dark:text-amber-400 p-0 h-auto text-sm mt-1"
                    onClick={() => window.open(`https://pancakeswap.finance/swap?outputCurrency=${selectedToken.tokenAddress}`, '_blank')}
                  >
                    Trade on PancakeSwap →
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <TokenSwapCard 
                slippage={slippage}
                setSlippage={setSlippage}
                selectedToken={selectedToken}
                amount={amount}
                setAmount={setAmount}
                isBuying={isBuying}
                isTrading={isTrading}
                handleSwapMode={handleSwapMode}
                handleSwap={handleSwap}
                estimatedReceiveAmount={estimatedReceiveAmount}
                bnbBalance={bnbBalance}
                tokenBalance={tokenBalance}
              />
            </div>
            <div className="space-y-6">
              {selectedToken ? (
                <>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            {selectedToken.name} 
                            <VerificationBadge tokenAddress={selectedToken.tokenAddress} />
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            ${selectedToken.symbol}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {selectedToken.VBNB} BNB Pool
                            {bnbUsdPrice && (
                              <div className="text-xs text-muted-foreground">
                                ≈ ${(parseFloat(selectedToken.VBNB || '0') * bnbUsdPrice).toFixed(2)} USD
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="migration">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="migration">Migration Progress</TabsTrigger>
                          <TabsTrigger value="details">Token Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="migration" className="space-y-4 mt-4">
                          <div>
                            <div className="flex justify-between mb-2 text-sm">
                              <span>Progress to PancakeSwap</span>
                              <span>{migrationProgress.toFixed(1)}%</span>
                            </div>
                            <Progress value={migrationProgress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 bg-secondary rounded-md">
                              <div className="text-xs text-muted-foreground mb-1">Current Pool</div>
                              <div className="font-medium">{selectedToken.VBNB} BNB</div>
                              {bnbUsdPrice && (
                                <div className="text-xs text-muted-foreground">
                                  ≈ {(parseFloat(selectedToken.VBNB || '0') * bnbUsdPrice).toFixed(2)} USD
                                </div>
                              )}
                            </div>
                            <div className="p-3 bg-secondary rounded-md">
                              <div className="text-xs text-muted-foreground mb-1">Threshold</div>
                              <div className="font-medium">{selectedToken.threshold} BNB</div>
                              {bnbUsdPrice && (
                                <div className="text-xs text-muted-foreground">
                                  ≈ {(parseFloat(selectedToken.threshold || '0') * bnbUsdPrice).toFixed(2)} USD
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-secondary rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">Token Reserve</div>
                            <div className="font-medium">{parseInt(selectedToken.VTOK || '0').toLocaleString()} {selectedToken.symbol}</div>
                          </div>
                        </TabsContent>
                        <TabsContent value="details" className="space-y-4 mt-4">
                          <div className="p-3 bg-secondary rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">Token Address</div>
                            <div className="font-mono text-sm break-all">{selectedToken.tokenAddress}</div>
                          </div>
                          {selectedToken.creator && (
                            <div className="p-3 bg-secondary rounded-md">
                              <div className="text-xs text-muted-foreground mb-1">Creator</div>
                              <div className="font-mono text-sm break-all">{selectedToken.creator}</div>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/token/${selectedToken.tokenAddress}`)}
                          >
                            View Full Dashboard
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                  {isCreator && parseFloat(creatorFees) > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Creator Fees</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <div className="text-sm text-muted-foreground mb-1">Available to Claim</div>
                          <div className="flex items-end justify-between">
                            <div className="text-xl font-medium text-green-700 dark:text-green-400">
                              {parseFloat(creatorFees).toFixed(6)} BNB
                              {bnbUsdPrice && (
                                <div className="text-sm text-muted-foreground">
                                  ≈ {(parseFloat(creatorFees) * (bnbUsdPrice || 0)).toFixed(2)} USD
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={handleClaimFees} 
                              disabled={isClaimingFees || parseFloat(creatorFees) === 0}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {isClaimingFees ? 'Claiming...' : 'Claim Fees'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Token Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
                        <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Select a token to view details</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        Search for a token by address to view its migration progress, trade, or claim fees if you're the creator.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                        <div className="p-4 border border-dashed rounded-md text-center">
                          <Coins className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Track migration progress to PancakeSwap
                          </p>
                        </div>
                        <div className="p-4 border border-dashed rounded-md text-center">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            View trading volume and liquidity details
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeTokens;
