import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWeb3 } from "@/lib/web3Context";
import { Loader2, ArrowLeft, Package, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: number;
  tokenId: number | null;
  sellerWallet: string;
  title: string;
  description: string | null;
  priceEth: string;
  imageUrl: string | null;
  category: string | null;
  condition: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account, isConnected, web3Manager } = useWeb3();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing(id);
    }
  }, [id]);

  const fetchListing = async (listingId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setListing(data);
      } else {
        toast.error("Listing not found");
        navigate("/marketplace");
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!listing || account === listing.sellerWallet) {
      toast.error("You cannot purchase your own item");
      return;
    }

    setPurchasing(true);
    try {
      // Create transaction record in database
      const txResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: listing.tokenId || 0,
          sellerWallet: listing.sellerWallet,
          buyerWallet: account,
          listingId: listing.id,
          priceEth: listing.priceEth,
        }),
      });

      if (!txResponse.ok) {
        throw new Error("Failed to create transaction record");
      }

      const txData = await txResponse.json();

      // Try to execute smart contract transaction if web3Manager is available
      if (web3Manager && listing.tokenId) {
        try {
          const txHash = await web3Manager.purchaseNFT(listing.tokenId, listing.priceEth);
          
          // Update transaction with blockchain hash
          await fetch(`/api/transactions/${txData.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "completed",
              txHash,
            }),
          });

          // Deactivate listing
          await fetch(`/api/listings/${listing.id}`, {
            method: "DELETE",
          });

          toast.success("Purchase successful! Check your wallet for the NFT.");
          setTimeout(() => {
            navigate("/marketplace");
          }, 2000);
        } catch (contractError) {
          // If smart contract fails, keep transaction as pending
          console.error("Smart contract error:", contractError);
          toast.warning("Transaction recorded but smart contract execution pending. Check back soon.");
          setTimeout(() => {
            navigate("/marketplace");
          }, 3000);
        }
      } else {
        // Without smart contracts, just record the transaction
        toast.success("Purchase recorded! Contact seller to complete the transaction.");
        setTimeout(() => {
          navigate("/marketplace");
        }, 2000);
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process purchase");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Listing Not Found</h2>
        <Button onClick={() => navigate("/marketplace")} variant="outline" className="mt-4">
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const isOwnItem = account === listing.sellerWallet;
  const canPurchase = isConnected && !isOwnItem && listing.isActive;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/marketplace")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center sticky top-20">
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">{listing.title}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{listing.priceEth}</span>
              <span className="text-lg text-muted-foreground">ETH</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {listing.category && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-semibold">{listing.category}</p>
              </Card>
            )}
            {listing.condition && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Condition</p>
                <p className="font-semibold">{listing.condition}</p>
              </Card>
            )}
          </div>

          {/* Seller Info */}
          <Card className="p-4 bg-secondary">
            <p className="text-sm text-muted-foreground">Seller</p>
            <p className="font-mono text-sm break-all">
              {listing.sellerWallet.slice(0, 6)}...{listing.sellerWallet.slice(-4)}
            </p>
          </Card>

          {/* Listed Date */}
          <div>
            <p className="text-sm text-muted-foreground">
              Listed on {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t">
            {!isConnected ? (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet to Purchase
              </Button>
            ) : isOwnItem ? (
              <div className="p-4 bg-secondary rounded-lg text-center">
                <p className="text-muted-foreground">This is your item</p>
              </div>
            ) : !listing.isActive ? (
              <div className="p-4 bg-destructive/10 rounded-lg text-center">
                <p className="text-destructive">This item is no longer available</p>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy Now"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
