
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenFeeCardProps {
  ownerFee: string;
  creatorFee: string;
  isCreator: boolean;
  onClaimFees: () => Promise<void>;
  claimLoading: boolean;
  account: string | null;
}

const TokenFeeCard = ({ 
  ownerFee, 
  creatorFee, 
  isCreator, 
  onClaimFees, 
  claimLoading, 
  account 
}: TokenFeeCardProps) => {
  
  const creatorFeeNum = parseFloat(creatorFee);
  const hasClaimableFees = creatorFeeNum > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Information</CardTitle>
        <CardDescription>Accumulated fees and claiming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Owner Fee (BNB)</div>
            <div className="font-semibold">{parseFloat(ownerFee).toFixed(6)}</div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400">Creator Fee (BNB)</div>
            <div className="font-semibold">{parseFloat(creatorFee).toFixed(6)}</div>
          </div>
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
        
        {isCreator && !hasClaimableFees && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have any fees to claim at this time
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!isCreator || !hasClaimableFees || claimLoading} 
          onClick={onClaimFees}
        >
          {claimLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Claim My Fees'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenFeeCard;
