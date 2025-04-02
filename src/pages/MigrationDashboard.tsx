import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getContractInstance, isTokenMigrated } from '@/utils/contractUtils';
import { ethers } from 'ethers';
import Navigation from '@/components/Navigation';
import { Info, AlertCircle, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { getTokenInfo } from '@/utils/tokenUtils';
import TokenProgressCard from '@/components/migration/TokenProgressCard';
import TokenFeeCard from '@/components/migration/TokenFeeCard';
import Footer from '@/components/Footer';

const MigrationDashboard = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [tokenDetails, setTokenDetails] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [ownerFee, setOwnerFee] = useState<string>("0");
  const [creatorFee, setCreatorFee] = useState<string>("0");
  const [isCreator, setIsCreator] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

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

  const fetchTokenData = async () => {
    if (!tokenAddress) return;
    
    try {
      setLoading(true);
      const contract = await getContractInstance();
      
      console.log("Fetching data for token:", tokenAddress);
      
      // Get token info from the contract
      const tokenInfo = await contract.tokens(tokenAddress);
      console.log("Token info from contract:", tokenInfo);
      
      // Verify the migration status directly
      const migrationStatus = tokenInfo.migrated;
      console.log("Token migration status:", migrationStatus);
      
      setTokenInfo(tokenInfo);
      
      // Check if user is the creator
      setIsCreator(account && tokenInfo[5].toLowerCase() === account.toLowerCase());
      
      // Get fees
      if (account) {
        const ownerFee = await contract.ownerFeeBNB(tokenAddress);
        const creatorFee = await contract.creatorFeeBNB(tokenAddress);
        setOwnerFee(ethers.formatEther(ownerFee));
        setCreatorFee(ethers.formatEther(creatorFee));
      }
      
      // Get token details if possible
      if (tokenAddress) {
        try {
          const details = await getTokenInfo(tokenAddress);
          setTokenDetails(details);
        } catch (error) {
          console.error("Error fetching token details:", error);
        }
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

  useEffect(() => {
    if (tokenAddress) {
      fetchTokenData();
    }
  }, [tokenAddress, account]);

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

  const calculateProgress = () => {
    if (!tokenInfo) return 0;
    
    const threshold = parseFloat(ethers.formatEther(tokenInfo[1]));
    const vbnb = parseFloat(ethers.formatEther(tokenInfo[2]));
    
    if (threshold === 0) return 0;
    
    // Calculate progress as a percentage of threshold
    const progress = ((vbnb / threshold) * 100);
    
    // Cap at 100%
    return Math.min(progress, 100);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="container max-w-5xl mx-auto pt-24 px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Token Migration Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your token's progress and claim your creator fees</p>
        </div>
        
        {!tokenAddress ? (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No token selected</AlertTitle>
            <AlertDescription>
              Please navigate to this page with a token address parameter.
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Token Details</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="ml-1">Refresh</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy Address'}</span>
                </Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Token Information</CardTitle>
                  <CardDescription>Basic token details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</div>
                    <div className="font-mono text-sm break-all">{tokenAddress}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Name & Symbol</div>
                    <div>
                      {tokenDetails ? (
                        `${tokenDetails.name} (${tokenDetails.symbol})`
                      ) : (
                        <span className="text-gray-400">Unable to retrieve</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Creator</div>
                    <div className="font-mono text-sm">
                      {tokenInfo ? formatAddress(tokenInfo[5]) : 'Unknown'}
                      {isCreator && <span className="ml-2 text-green-500 text-xs">(You)</span>}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Migration Status</div>
                    <div>
                      {tokenInfo && tokenInfo[4] ? (
                        <span className="text-green-500">Migrated</span>
                      ) : (
                        <span className="text-yellow-500">In Progress</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <TokenProgressCard 
                threshold={tokenInfo ? ethers.formatEther(tokenInfo[1]) : "0"}
                vbnb={tokenInfo ? ethers.formatEther(tokenInfo[2]) : "0"}
                vtok={tokenInfo ? ethers.formatEther(tokenInfo[3]) : "0"}
                progress={calculateProgress()}
                migrated={tokenInfo ? tokenInfo[4] : false}
              />
            </div>
            
            <TokenFeeCard 
              ownerFee={ownerFee}
              creatorFee={creatorFee}
              isCreator={isCreator}
              onClaimFees={handleClaimFees}
              claimLoading={claimLoading}
              account={account}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MigrationDashboard;
