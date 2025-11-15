import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeWeb3, getWeb3Manager, Web3Manager } from "./web3";

interface User {
  id: number;
  walletAddress: string;
  userType: "seller" | "buyer" | "both";
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  user: User | null;
  balance: string | null;
  connectWallet: (userType?: "seller" | "buyer" | "both") => Promise<void>;
  disconnectWallet: () => void;
  web3Manager: Web3Manager | null;
  setUser: (user: User | null) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [web3Manager, setWeb3Manager] = useState<Web3Manager | null>(null);

  // Initialize Web3Manager
  useEffect(() => {
    console.log("OIOIOI TO AQUI AUAEIAOWFIOAWHFIOWA");
    const nftAddress =
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      "0x0000000000000000000000000000000000000000";

    console.log("pididdy: ", import.meta.env.VITE_CONTRACT_ADDRESS);
    console.log(nftAddress);
    const marketplaceAddress =
      import.meta.env.VITE_MARKETPLACE_ADDRESS ||
      "0x0000000000000000000000000000000000000000";
    const manager = initializeWeb3(nftAddress, marketplaceAddress);
    setWeb3Manager(manager);

    return () => {
      manager.removeListeners();
    };
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            setAccount(address);
            setIsConnected(true);
            await fetchUserProfile(address);
            await fetchBalance(address);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkConnection();
  }, []);

  // Setup listeners
  useEffect(() => {
    if (!web3Manager) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        setIsConnected(true);
        fetchUserProfile(newAccount);
        // Fetch balance only if provider is initialized
        if (web3Manager.isConnected()) {
          fetchBalance(newAccount);
        }
      }
    };

    const handleChainChanged = () => {
      // Refresh on network change
      if (account && web3Manager.isConnected()) {
        fetchBalance(account);
      }
    };

    web3Manager.onAccountsChanged(handleAccountsChanged);
    web3Manager.onChainChanged(handleChainChanged);

    return () => {
      web3Manager.removeListeners();
    };
  }, [web3Manager, account]);

  const fetchUserProfile = async (address: string) => {
    try {
      const response = await fetch(`/api/users/${address}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      if (web3Manager && web3Manager.isConnected()) {
        try {
          const bal = await web3Manager.getBalance(address);
          console.log(bal);
          setBalance(bal);
        } catch (err) {
          // Balance fetch failed, but don't break the app
          console.warn("Could not fetch balance:", err);
          setBalance("0");
        }
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const connectWallet = async (
    userType: "seller" | "buyer" | "both" = "both",
  ) => {
    setIsConnecting(true);
    try {
      if (!web3Manager) throw new Error("Web3Manager not initialized");

      // Connect to wallet
      const address = await web3Manager.connectWallet();

      // Ensure Sepolia network
      await web3Manager.ensureSepoliaNetwork();

      setAccount(address);
      setIsConnected(true);

      // Register user in backend
      const response = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          userType,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }

      console.log(address);

      // Fetch balance
      await fetchBalance(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setIsConnected(false);
      setAccount(null);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setUser(null);
    setBalance(null);
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected,
        isConnecting,
        user,
        balance,
        connectWallet,
        disconnectWallet,
        web3Manager,
        setUser,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
