
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coins, Tag, Info, Share2, Copy, Check, ArrowRight, Instagram, Twitter } from 'lucide-react';
import { createToken } from '@/utils/contractUtils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ethers } from 'ethers';

const createTokenSchema = z.object({
  tokenName: z.string().min(1, "Token name is required"),
  tokenSymbol: z.string().min(1, "Token symbol is required")
    .max(5, "Token symbol should be 5 characters or less"),
  migrationThreshold: z.coerce.number()
    .min(0.2, "Minimum threshold is 0.2 BNB"),
  totalSupply: z.coerce.number()
    .min(100000, "Minimum supply is 100,000 tokens")
});

type CreateTokenFormValues = z.infer<typeof createTokenSchema>;

const CreateToken = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<{address: string, name: string, symbol: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [bnbUsdPrice, setBnbUsdPrice] = useState<number | null>(null);
  
  // Fetch BNB price in USD
  React.useEffect(() => {
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
  }, []);
  
  const form = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      migrationThreshold: 100,
      totalSupply: 1000000,
    },
  });

  const watchThreshold = form.watch("migrationThreshold");
  const thresholdUsdValue = bnbUsdPrice ? (watchThreshold * bnbUsdPrice).toFixed(2) : null;

  const onSubmit = async (data: CreateTokenFormValues) => {
    console.log('Form submitted:', data);
    
    setIsCreating(true);
    try {
      // Get the parameters from the form
      const { tokenName, tokenSymbol, migrationThreshold, totalSupply } = data;
      
      const result = await createToken(tokenName, tokenSymbol, migrationThreshold, totalSupply);
      
      // Extract the token address from the result
      const tokenAddress = result.tokenAddress;
      
      setCreatedToken({
        address: tokenAddress,
        name: tokenName,
        symbol: tokenSymbol
      });
      
      toast({
        title: "Token Created!",
        description: `Your ${tokenName} (${tokenSymbol}) token has been created successfully.`,
      });
    } catch (error) {
      console.error("Token creation failed:", error);
      toast({
        title: "Token Creation Failed",
        description: "There was an error creating your token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Link has been copied to clipboard.",
    });
  };

  const tradePageLink = createdToken ? `${window.location.origin}/trade?token=${createdToken.address}` : '';
  const shareText = createdToken ? `I just created my ${createdToken.name} token on SponSaura! Support me by buying some tokens: ${tradePageLink}` : '';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Create Your Token</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Launch your own token on the Binance Smart Chain and give your fans a new way to support you
            </p>
          </div>

          {createdToken ? (
            <div className="glass-card p-8 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                  <Check className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Your Token is Ready!</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your {createdToken.name} ({createdToken.symbol}) token has been created successfully.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Address</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(createdToken.address)}
                      className="h-6 px-2"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="font-mono text-sm break-all">{createdToken.address}</div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Trading Page Link</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(tradePageLink)}
                      className="h-6 px-2 text-blue-600"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">{tradePageLink}</div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                  <p className="text-sm mb-3">To verify your token, please send your token address to @SponSaura on Twitter/X or Instagram:</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="bg-pink-600 hover:bg-pink-700 text-white flex-1 flex items-center justify-center"
                      onClick={() => window.open(`https://instagram.com/sponsaura`, '_blank')}
                    >
                      <Instagram className="mr-2 h-4 w-4" /> Verify on Instagram
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 flex items-center justify-center"
                      onClick={() => window.open(`https://twitter.com/sponsaura`, '_blank')}
                    >
                      <Twitter className="mr-2 h-4 w-4" /> Verify on Twitter
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                  <Button 
                    className="bg-pink-600 hover:bg-pink-700 text-white flex-1"
                    onClick={() => window.open(`https://instagram.com/create/story?text=${encodeURIComponent(shareText)}`, '_blank')}
                  >
                    <Instagram className="mr-2 h-4 w-4" /> Share on Instagram
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  >
                    <Twitter className="mr-2 h-4 w-4" /> Share on Twitter
                  </Button>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="link" 
                    className="text-blue-600 w-full"
                    onClick={() => window.location.href = tradePageLink}
                  >
                    Go to Trading Page <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 shadow-sm">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300 font-medium">
                  About the Migration Threshold
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  <p className="mt-2">
                    The migration threshold determines when your token moves to PancakeSwap. It's just virtual for now to help put a price on your token (You don't pay anything for now).
                  </p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>When reached, your token automatically migrates to PancakeSwap</li>
                    <li>You'll receive <span className="font-medium">5% of the threshold value in BNB</span> as a reward</li>
                    <li>You'll earn <span className="font-medium">1% in BNB from every trade</span> your fans make</li>
                  </ul>
                  <p className="mt-2">
                    Consider promoting your token on social media to help reach the threshold faster!
                  </p>
                </AlertDescription>
              </Alert>

              <div className="glass-card p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tokenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Name</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <Tag className="h-4 w-4 text-gray-500" />
                              <Input placeholder="e.g. My Awesome Token" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Choose a name that represents you or your brand
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tokenSymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Symbol</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <Coins className="h-4 w-4 text-gray-500" />
                              <Input placeholder="e.g. AWSM" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            A short ticker symbol for your token (1-5 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalSupply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Supply</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <Input 
                                type="number" 
                                min={100000}
                                step={100000}
                                {...field}
                              />
                              <span className="text-sm font-medium">Tokens</span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Total supply of your token (minimum: 100,000)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="migrationThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PancakeSwap Migration Threshold (BNB)</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 items-center">
                              <Input 
                                type="number" 
                                min={0.2}
                                step={0.1}
                                {...field}
                              />
                              <span className="text-sm font-medium">BNB</span>
                            </div>
                          </FormControl>
                          <FormDescription className="flex justify-between">
                            <span>Amount of BNB needed to migrate to PancakeSwap (min: 0.2 BNB)</span>
                            {thresholdUsdValue && (
                              <span className="font-medium">≈ ${thresholdUsdValue} USD</span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating Token..." : "Create Token"}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateToken;
