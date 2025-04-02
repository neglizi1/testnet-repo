
import { ethers } from 'ethers';

// Basic ERC20 ABI for name, symbol, and total supply
const erc20ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export const getTokenInfo = async (tokenAddress: string) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
    
    const [name, symbol, totalSupply, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      tokenContract.decimals().catch(() => 18) // Default to 18 if not available
    ]);
    
    return {
      name,
      symbol,
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      decimals
    };
  } catch (error) {
    console.error("Error getting token info:", error);
    throw error;
  }
};
