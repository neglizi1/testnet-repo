import { ethers } from 'ethers';

// ABI for your TokenCreator contract - updated with the provided ABI
const tokenCreatorABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "swapType",
        "type": "string"
      }
    ],
    "name": "TokensSwapped",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "slippageTolerance",
        "type": "uint256"
      }
    ],
    "name": "swapBNBForToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      }
    ],
    "name": "TokenCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "liquidityBNB",
        "type": "uint256"
      }
    ],
    "name": "TokenMigrated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "MAX_SLIPPAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "T",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "TAX_PERCENT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "claimCreatorFeesBNB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSupply",
        "type": "uint256"
      }
    ],
    "name": "createToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "creatorFeeBNB",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "slippageTolerance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "swapTokenForBNB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "tokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "threshold",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "VBNB",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "VTOK",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "migrated",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Your updated deployed contract address on BSC mainnet
const CONTRACT_ADDRESS = "0x258307b234b54926B81B0b3D4E8CDA16A701dc13";

export const getContractInstance = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, tokenCreatorABI, signer);
  } catch (error) {
    console.error("Error getting contract instance:", error);
    throw error;
  }
};

// Function to create a new token
export const createToken = async (tokenName: string, tokenSymbol: string, migrationThreshold: number, totalSupply: number = 1000000) => {
  try {
    const contract = await getContractInstance();
    // Convert the threshold to wei (ethers)
    const thresholdInWei = ethers.parseEther(migrationThreshold.toString());
    
    // Convert supply to wei units
    const totalSupplyBN = ethers.parseUnits(totalSupply.toString(), 18);
    
    console.log(`Creating token with name: ${tokenName}, symbol: ${tokenSymbol}, threshold: ${thresholdInWei}, supply: ${totalSupplyBN}`);
    
    const tx = await contract.createToken(tokenName, tokenSymbol, thresholdInWei, totalSupplyBN);
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    // Properly extract the token address from the event logs
    const tokenCreatedEvent = receipt.logs
      .map(log => {
        try {
          return contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
        } catch (e) {
          return null;
        }
      })
      .find(event => event && event.name === 'TokenCreated');
    
    if (tokenCreatedEvent && tokenCreatedEvent.args) {
      // Return the token address from the event
      console.log("Token created successfully:", tokenCreatedEvent.args.tokenAddress);
      return {
        success: true,
        receipt: receipt,
        tokenAddress: tokenCreatedEvent.args.tokenAddress
      };
    } else {
      console.error("Token creation event not found in logs");
      return {
        success: false,
        error: "Token creation event not found in transaction logs"
      };
    }
  } catch (error) {
    console.error("Error creating token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

// Function to verify a token
export const verifyToken = async (tokenAddress: string) => {
  try {
    const contract = await getContractInstance();
    // Get token info from the contract to verify if it exists
    const tokenInfo = await contract.tokens(tokenAddress);
    // If tokenAddress matches the returned tokenAddress, it's a valid token
    return tokenInfo[0].toLowerCase() === tokenAddress.toLowerCase() && tokenInfo[0] !== ethers.ZeroAddress;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

// Function to trade tokens
export const tradeTokens = async (
  tokenAddress: string, 
  amount: string, 
  isBuying: boolean,
  slippageTolerance: number = 500 // Default to 5% (500 basis points)
) => {
  try {
    const contract = await getContractInstance();
    
    if (isBuying) {
      // For buying tokens with BNB
      const ethAmount = ethers.parseEther(amount);
      const tx = await contract.swapBNBForToken(tokenAddress, slippageTolerance, { value: ethAmount });
      return await tx.wait();
    } else {
      // For selling tokens to get BNB
      const tokenAmount = ethers.parseUnits(amount, 18); // assuming 18 decimals
      
      // First we need to approve the contract to spend our tokens
      const erc20Interface = new ethers.Interface([
        "function approve(address spender, uint256 amount) returns (bool)"
      ]);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, erc20Interface, signer);
      
      // Approve the contract to spend the tokens
      const approveTx = await tokenContract.approve(contract.target, tokenAmount);
      await approveTx.wait();
      
      // Now swap tokens for BNB
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
      const tx = await contract.swapTokenForBNB(tokenAddress, tokenAmount, slippageTolerance, deadline, 0, ethers.ZeroHash, ethers.ZeroHash);
      return await tx.wait();
    }
  } catch (error) {
    console.error("Error trading tokens:", error);
    throw error;
  }
};

// Function to check if a token has been migrated
export const isTokenMigrated = async (tokenAddress: string) => {
  try {
    const contract = await getContractInstance();
    console.log("Checking migration status for token:", tokenAddress);
    const tokenInfo = await contract.tokens(tokenAddress);
    console.log("Token migration status:", tokenInfo.migrated);
    return tokenInfo.migrated;
  } catch (error) {
    console.error("Error checking if token migrated:", error);
    return false;
  }
};

// Other existing functions
export const claimCreatorFees = async (tokenAddress: string) => {
  try {
    const contract = await getContractInstance();
    const tx = await contract.claimCreatorFeesBNB(tokenAddress);
    return await tx.wait();
  } catch (error) {
    console.error("Error claiming creator fees:", error);
    throw error;
  }
};

export const getCreatorFees = async (tokenAddress: string) => {
  try {
    const contract = await getContractInstance();
    const fees = await contract.creatorFeeBNB(tokenAddress);
    return ethers.formatEther(fees);
  } catch (error) {
    console.error("Error getting creator fees:", error);
    throw error;
  }
};

export const isTokenCreator = async (tokenAddress: string) => {
  try {
    const contract = await getContractInstance();
    const tokenInfo = await contract.tokens(tokenAddress);
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    
    if (accounts.length === 0) {
      return false;
    }
    
    const currentWallet = accounts[0].address.toLowerCase();
    const creator = tokenInfo.creator.toLowerCase();
    
    return currentWallet === creator;
  } catch (error) {
    console.error("Error checking token creator:", error);
    return false;
  }
};
