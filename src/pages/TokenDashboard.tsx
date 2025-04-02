import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getContractInstance } from '@/utils/contractUtils';
import { ethers } from 'ethers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Copy, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { getTokenInfo } from '@/utils/tokenUtils';
import TokenProgressCard from '@/components/migration/TokenProgressCard';
import TokenFeeCard from '@/components/migration/TokenFeeCard';

const TokenDashboard = () => {
  const { tokenAddress: initialTokenAddress } = useParams<{ tokenAddress: string }>();
  const [tokenAddress, setTokenAddress] = useState<string>(initialTokenAddress || '');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [creatorFee, setCreatorFee] = useState<string>("0");
  const [isCreator, setIsCreator] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current account and listen for changes
  useEffect(() => {
    if (window.ethereum) {
      const getCurrentAccount = async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
          }
        } catch (error) {
          console.error("Error getting current account:", error);
        }
      };
      getCurrentAccount();
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  useEffect(() => {
    // Set token address from URL param if available
    if (initialTokenAddress) {
      setTokenAddress(initialTokenAddress);
      fetchTokenData(initialTokenAddress);
    }
  }, [initialTokenAddress]);

  const fetchTokenData = async (address = tokenAddress) => {
    if (!address || !ethers.isAddress(address)) return;
    try {
      setLoading(true);
      const contract = await getContractInstance();
      console.log("Fetching token data for address:", address);
      // tokenInfo: [0] tokenAddress, [1] totalSupply, [2] threshold, [3] VBNB, [4] VTOK, [5] migrated, [6] creator
      const tokenData = await contract.tokens(address);
      console.log("Token info from contract:", tokenData);
      setTokenInfo(tokenData);
      // Check if user is the creator (compare with tokenData[6])
      if (account && tokenData[6]) {
        setIsCreator(account.toLowerCase() === tokenData[6].toLowerCase());
      }
      // Get fees if account exists
      if (account) {
        const creatorFeeBNB = await contract.creatorFeeBNB(address);
        setCreatorFee(ethers.formatEther(creatorFeeBNB));
      }
      // Get token details if possible (using ERC20 interface)
      try {
        const details = await getTokenInfo(address);
        setTokenDetails(details);
      } catch (error) {
        console.error("Error fetching token details:", error);
      }
    } catch (error) {
      console.error("Error fetching token data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch token data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(e.target.value);
  };

  const handleSearch = () => {
    if (!tokenAddress) return;
    // Update URL without reloading the page
    navigate(`/token/${tokenAddress}`);
    fetchTokenData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTokenData();
  };

  const handleCopyAddress = () => {
    if (tokenAddress) {
      navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Token address copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimFees = async () => {
    if (!tokenAddress || !isCreator) return;
    try {
      setClaimLoading(true);
      const contract = await getContractInstance();
      const tx = await contract.claimCreatorFeesBNB(tokenAddress);
      toast({
        title: "Transaction Submitted",
        description: "Your claim transaction has been submitted"
      });
      await tx.wait();
      toast({
        title: "Fees Claimed",
        description: "You have successfully claimed your creator fees",
        variant: "default"
      });
      // Refresh data
      fetchTokenData();
    } catch (error) {
      console.error("Error claiming fees:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim creator fees. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaimLoading(false);
    }
  };

  // Calculate progress using correct indexes:
  // Threshold is at tokenInfo[2] and VBNB is at tokenInfo[3]
  // New logic: progress = ((VBNB - threshold) / threshold) * 100, clamped to 0–100
  const calculateProgress = () => {
    if (!tokenInfo) return 0;
    const threshold = parseFloat(ethers.formatEther(tokenInfo[2]));
    const vbnb = parseFloat(ethers.formatEther(tokenInfo[3]));
    if (threshold === 0) return 0;
    const extraBNB = vbnb - threshold;
    const progress = extraBNB <= 0 ? 0 : (extraBNB / threshold) * 100;
    return Math.min(progress, 100);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleTradeToken = () => {
    if (tokenAddress) {
      navigate(`/trade?token=${tokenAddress}`);
    } else {
      navigate('/trade');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <main className="container max-w-5xl mx-auto pt-24 px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Token Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your token's progress and claim your creator fees</p>
        </div>
        {/* Token Address Search */}
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter token address to view details"
                  value={tokenAddress}
                  onChange={handleAddressChange}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={!tokenAddress || loading}>
                  Search
                </Button>
              </div>
              {!tokenAddress && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Enter a token address above to view its details and progress.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          <>
            {tokenAddress && (
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Token Details</h2>
                  <Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="ml-1">Refresh</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAddress} className="flex items-center gap-1">
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied' : 'Copy Address'}</span>
                  </Button>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Token Information</CardTitle>
                  <CardDescription>Basic token details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tokenInfo ? (
                    <>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</div>
                        <div className="font-mono text-sm break-all">{tokenAddress}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Name & Symbol</div>
                        <div>
                          {tokenDetails ? `${tokenDetails.name} (${tokenDetails.symbol})` : <span className="text-gray-400">Unable to retrieve</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Creator</div>
                        <div className="font-mono text-sm">
                          {tokenInfo && tokenInfo[6] ? formatAddress(tokenInfo[6]) : 'Unknown'}
                          {isCreator && <span className="ml-2 text-green-500 text-xs">(You)</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Migration Status</div>
                        <div>
                          {tokenInfo && tokenInfo[5] ? (
                            <span className="text-green-500">Migrated</span>
                          ) : (
                            <span className="text-yellow-500">In Progress</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</div>
                        <div className="text-gray-400">Not available</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Name & Symbol</div>
                        <div className="text-gray-400">Your token name and symbol will appear here</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Creator</div>
                        <div className="text-gray-400">Creator address will be shown here</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Migration Status</div>
                        <div className="text-gray-400">Migration status will be displayed here</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              {tokenInfo ? (
                <TokenProgressCard 
                  threshold={ethers.formatEther(tokenInfo[2])}
                  vbnb={ethers.formatEther(tokenInfo[3])}
                  vtok={ethers.formatEther(tokenInfo[4])}
                  progress={calculateProgress()}
                  migrated={tokenInfo[5]}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Migration Progress</CardTitle>
                    <CardDescription>Track your token's migration status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Migration Progress</span>
                        <span className="text-sm font-medium">0%</span>
                      </div>
                      <Progress value={0} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Threshold</div>
                        <div className="font-semibold">0.00 BNB</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Virtual BNB</div>
                        <div className="font-semibold">0.00 BNB</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg col-span-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Virtual Tokens</div>
                        <div className="font-semibold">0 Tokens</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Trade Token Button */}
            <div className="mb-6">
              <Button onClick={handleTradeToken} className="w-full h-12 text-base" variant="secondary">
                Trade This Token
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {/* Fee Card */}
            <Card>
              <CardHeader>
                <CardTitle>Creator Fee Information</CardTitle>
                <CardDescription>Claim your accumulated fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tokenInfo ? (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Creator Fee (BNB)</div>
                      <div className="font-semibold">{parseFloat(creatorFee).toFixed(6)}</div>
                    </div>
                    {!account && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Connect your wallet to check if you can claim fees
                        </AlertDescription>
                      </Alert>
                    )}
                    {account && !isCreator && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Only token creators can claim fees for this token
                        </AlertDescription>
                      </Alert>
                    )}
                    {isCreator && parseFloat(creatorFee) <= 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You don't have any fees to claim at this time
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Creator Fee (BNB)</div>
                      <div className="font-semibold">0.000000</div>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Enter a token address to see available fees to claim
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={!isCreator || parseFloat(creatorFee) <= 0 || claimLoading} 
                  onClick={handleClaimFees}
                >
                  {claimLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Claim My Fees'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TokenDashboard;
