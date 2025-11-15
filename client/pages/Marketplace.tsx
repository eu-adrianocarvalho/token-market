import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/lib/web3Context";
import { Loader2, Package, Search } from "lucide-react";

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

export default function Marketplace() {
  const { isConnected } = useWeb3();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    // Filter listings based on search term
    const filtered = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredListings(filtered);
  }, [searchTerm, listings]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/listings");
      if (response.ok) {
        const data = await response.json();
        setListings(data);
        setFilteredListings(data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          Conecte sua Carteira MetaMask
        </h2>
        <p className="text-muted-foreground mb-6">
          Por favor conecte sua carteira MetaMask para visualizar o marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Veja e compre ativos tokenizados de vendedores ao redor do mundo
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Busque por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              Não existem itens listados
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Tente ajustar a sua pesquisa"
                : "Seja o primeiro a listar um ativo!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Link key={listing.id} to={`/product/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition h-full cursor-pointer">
                  {/* Image */}
                  <div className="aspect-square bg-muted overflow-hidden flex items-center justify-center">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold line-clamp-2">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {listing.description}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Preço</p>
                        <p className="text-lg font-bold">
                          {listing.priceEth} ETH
                        </p>
                      </div>
                      <Button size="sm">Buy Now</Button>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      {listing.category && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {listing.category}
                        </span>
                      )}
                      {listing.condition && (
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {listing.condition}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
