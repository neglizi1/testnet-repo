
// Simulated database of verified tokens - in a real app, this would fetch from an API

interface VerifiedToken {
  tokenAddress: string;
  name: string;
  symbol: string;
  username: string;
}

// Instagram verified tokens
export const instagramVerifiedTokens: VerifiedToken[] = [
  {
    tokenAddress: "0x1234567890123456789012345678901234567890",
    name: "SponSaura Demo",
    symbol: "SPONS",
    username: "sponsaura"
  },
  // Add more verified tokens as needed
];

// Twitter verified tokens
export const twitterVerifiedTokens: VerifiedToken[] = [
  {
    tokenAddress: "0x0987654321098765432109876543210987654321",
    name: "SponSaura Official",
    symbol: "SPON",
    username: "sponsaura"
  },
  // Add more verified tokens as needed
];

// Check if a token is verified on Instagram
export const isInstagramVerified = (tokenAddress: string): boolean => {
  return instagramVerifiedTokens.some(token => 
    token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  );
};

// Check if a token is verified on Twitter
export const isTwitterVerified = (tokenAddress: string): boolean => {
  return twitterVerifiedTokens.some(token => 
    token.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  );
};

// Get verification details for a token
export const getVerificationDetails = (tokenAddress: string) => {
  const instagramVerified = isInstagramVerified(tokenAddress);
  const twitterVerified = isTwitterVerified(tokenAddress);
  
  return {
    instagramVerified,
    twitterVerified,
    isVerified: instagramVerified || twitterVerified
  };
};
