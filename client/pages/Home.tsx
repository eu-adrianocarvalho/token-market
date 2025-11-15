import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3Context";
import { ArrowRight, ShoppingCart, Package, Zap } from "lucide-react";

export default function Home() {
  const { isConnected, connectWallet } = useWeb3();

  const handleGetStarted = async () => {
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (error) {
        console.error("Connection failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Compre & Venda{" "}
            </h1>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Ativos Tokenizados
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Um mercado descentralizado para negociação de bens tokenizados.
              Conectar sua carteira MetaMask, liste seus ativos e negocie com
              segurança no Rede Ethereum Sepolia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/marketplace">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Navegar no Marketplace
              </Button>
            </Link>
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-blue-500 to-purple-600"
              onClick={handleGetStarted}
            >
              {isConnected ? (
                <>
                  <Link to="/sell" className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Começar a Vender
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Conectar Carteira MetaMask
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Como Funciona?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">
              Conecte sua Carteira MetaMask
            </h3>
            <p className="text-muted-foreground">
              Conecte sua carteira MetaMask à rede de teste Ethereum Sepolia.
              Seu carteira é sua identidade e forma de pagamento.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Liste seus Ativos</h3>
            <p className="text-muted-foreground">
              Faça upload de fotos, adicione descrições e defina preços em ETH.
              Seus itens são cunhados como NFTs e listados no mercado.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-lg border border-border bg-card hover:shadow-lg transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Compras Seguras</h3>
            <p className="text-muted-foreground">
              Navegue pelo marketplace, compre ativos e a propriedade é
              automaticamente transferido via contrato inteligente. Não são
              necessários intermediários.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-8 md:p-16">
          <div className="relative z-10 max-w-2xl mx-auto text-center text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para Começar a Negociar?
            </h2>
            <p className="text-lg opacity-90">
              Junte-se a milhares de usuários compradores e vendedores de ativos
              tokenizados na nova tecnologia da Web 3.0: Blockchain
            </p>
            <Link to={isConnected ? "/marketplace" : "#"}>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 gap-2 mt-8"
                onClick={!isConnected ? handleGetStarted : undefined}
              >
                {isConnected ? "Navegue Agora" : "Vamos Começar"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TokenMarket Decentralized Marketplace © 2025</p>
          <p>Apenas para testes na Ethereum Sepolia testnet</p>
        </div>
      </footer>
    </div>
  );
}
