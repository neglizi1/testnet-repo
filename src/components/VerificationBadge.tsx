
import React from 'react';
import { Instagram, Twitter, CheckCircle2 } from 'lucide-react';
import { isInstagramVerified, isTwitterVerified } from '@/utils/verificationData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  tokenAddress: string;
  size?: 'sm' | 'md' | 'lg';
}

const VerificationBadge = ({ tokenAddress, size = 'sm' }: VerificationBadgeProps) => {
  const instagramVerified = isInstagramVerified(tokenAddress);
  const twitterVerified = isTwitterVerified(tokenAddress);
  
  if (!instagramVerified && !twitterVerified) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'h-3 w-3 mr-1',
    md: 'h-4 w-4 mr-1',
    lg: 'h-5 w-5 mr-1',
  };
  
  return (
    <TooltipProvider>
      <div className="inline-flex items-center">
        {instagramVerified && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="badge-instagram inline-flex items-center px-1.5 py-0.5 rounded mr-1">
                <Instagram className={sizeClasses[size]} />
                <span className="sr-only">Instagram Verified</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Verified on Instagram @SponSaura</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        {twitterVerified && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="badge-twitter inline-flex items-center px-1.5 py-0.5 rounded">
                <Twitter className={sizeClasses[size]} />
                <span className="sr-only">Twitter Verified</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Verified on Twitter @SponSaura</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};

export default VerificationBadge;
