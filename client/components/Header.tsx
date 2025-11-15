import { Link } from "react-router-dom";
import { useWeb3 } from "@/lib/web3Context";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { account, isConnected, balance, connectWallet, disconnectWallet } =
    useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "";

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="hidden sm:inline">TokenMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/marketplace"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
            >
              Marketplace
            </Link>
            <Link
              to="/sell"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition"
            >
              Sell
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{shortAddress}</p>
                  <p className="text-xs text-muted-foreground">
                    {balance?.slice(0, 5)} ETH
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnectWallet}
                  title="Disconnect wallet"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleConnect}
                className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Connect Wallet</span>
                <span className="sm:hidden">Connect</span>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t space-y-3">
            <Link
              to="/marketplace"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/sell"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
