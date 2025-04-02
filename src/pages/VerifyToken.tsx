
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Search, CheckCircle, XCircle, Instagram, Twitter, AlertCircle, Copy, Check } from 'lucide-react';
import { verifyToken, getContractInstance } from '@/utils/contractUtils';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { isInstagramVerified, isTwitterVerified } from '@/utils/verificationData';

interface UserToken {
  address: string;
  name: string;
  symbol: string;
}

const VerifyToken = () => {
  const [address, setAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message: string } | null>(null);
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<{name?: string; symbol?: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch tokens created by user
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!window.ethereum) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length === 0) return;
        
        setLoading(true);
        
        // In a real application, this would query a database or smart contract events
        // For now, we'll leave this as a placeholder
        setUserTokens([]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user tokens:", error);
        setLoading(false);
      }
    };
    
    fetchUserTokens();
  }, []);

  // Fetch token details when address changes
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!address || !ethers.isAddress(address)) {
        setTokenDetails(null);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Basic ERC20 interface
        const erc20Interface = new ethers.Interface([
          "function name() view returns (string)",
          "function symbol() view returns (string)"
        ]);
        
        const tokenContract = new ethers.Contract(address, erc20Interface, provider);
        
        const [name, symbol] = await Promise.all([
          tokenContract.name().catch(() => "Unknown Token"),
          tokenContract.symbol().catch(() => "???")
        ]);
        
        setTokenDetails({ name, symbol });
      } catch (error) {
        console.error("Error fetching token details:", error);
        setTokenDetails({ name: "Unknown Token", symbol: "???" });
      }
    };

    fetchTokenDetails();
  }, [address]);

  const handleVerify = async () => {
    if (!address) return;
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      console.log('Verifying token:', address);
      
      // First check if the token address is valid
      const isValidToken = await verifyToken(address);
      
      // Then check if the token is verified on social media
      const instagramVerified = isInstagramVerified(address);
      const twitterVerified = isTwitterVerified(address);
      
      if (isValidToken) {
        if (instagramVerified || twitterVerified) {
          // Token is both valid and verified on social media
          setVerificationResult({
            verified: true,
            message: "This token contract is verified and authenticated on social media."
          });
          toast({
            title: "Token Verified",
            description: "This token contract is verified and authenticated on social media.",
          });
        } else {
          // Token is valid but not verified on social media
          setVerificationResult({
            verified: false,
            message: "This token contract is valid but not verified on social media. Send your token address to @SponSaura on Twitter or Instagram for verification."
          });
          toast({
            title: "Verification Incomplete",
            description: "This token contract is valid but not verified on social media.",
            variant: "destructive",
          });
        }
      } else {
        // Token is not valid
        setVerificationResult({
          verified: false,
          message: "This token contract could not be verified or has security issues."
        });
        toast({
          title: "Verification Failed",
          description: "This token contract could not be verified or has security issues.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        verified: false,
        message: "An error occurred during verification. Please try again."
      });
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Token address has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold text-center mb-8">Verify Token</h1>
        
        <div className="max-w-lg mx-auto">
          <Card className="border-teal-100 dark:border-teal-900/30 shadow-sm mb-6">
            <CardHeader>
              <CardTitle>Token Verification</CardTitle>
              <CardDescription>
                Verify the authenticity of tokens on the Binance Smart Chain network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter token contract address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleVerify} 
                    disabled={isVerifying || !address}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    {isVerifying ? "Verifying..." : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                {tokenDetails && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{tokenDetails.name}</h3>
                        <p className="text-sm text-muted-foreground">Symbol: {tokenDetails.symbol}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(address)}
                        className="h-8"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                
                {verificationResult && (
                  <div className={`p-4 rounded-md mt-2 ${
                    verificationResult.verified 
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" 
                      : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  }`}>
                    <div className="flex items-center gap-2">
                      {verificationResult.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <span className={verificationResult.verified 
                        ? "text-green-800 dark:text-green-300" 
                        : "text-red-800 dark:text-red-300"
                      }>
                        {verificationResult.message}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md mt-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 dark:text-blue-300 font-medium">Verification Instructions</p>
                      <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                        To verify your token on Twitter/X or Instagram:
                      </p>
                      <ol className="list-decimal ml-5 text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1">
                        <li>Ensure your username matches the token name</li>
                        <li>Send your token's address to @SponSaura on Instagram or Twitter</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row w-full space-y-2 sm:space-y-0 sm:space-x-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 text-white flex items-center justify-center"
                  onClick={() => window.open("https://instagram.com/sponsaura", "_blank")}
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Contact on Instagram
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-gray-800 to-blue-600 hover:opacity-90 text-white flex items-center justify-center"
                  onClick={() => window.open("https://twitter.com/sponsaura", "_blank")}
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Contact on Twitter
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* User's Created Tokens Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Created Tokens</CardTitle>
              <CardDescription>
                Tokens you've created using SponSaura appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading your tokens...</p>
                </div>
              ) : userTokens.length > 0 ? (
                <div className="space-y-2">
                  {userTokens.map((token) => (
                    <div key={token.address} className="p-3 bg-secondary rounded-md flex justify-between items-center">
                      <div>
                        <p className="font-medium">{token.name} ({token.symbol})</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {token.address.substring(0, 8)}...{token.address.substring(token.address.length - 6)}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setAddress(token.address);
                          handleVerify();
                        }}
                      >
                        Verify
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 border border-dashed rounded-md">
                  <p className="text-muted-foreground mb-2">No tokens found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your wallet to see tokens you've created
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/create'}
                  >
                    Create a New Token
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyToken;
