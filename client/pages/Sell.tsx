import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/lib/web3Context";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Sell() {
  const navigate = useNavigate();
  const { account, isConnected } = useWeb3();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceEth: "",
    category: "",
    condition: "new",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your MetaMask wallet to list items for sale.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.priceEth) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    try {
      // Upload image
      setUploadProgress(30);
      const imageUrl = await uploadImage(imageFile);

      // Create listing
      setUploadProgress(60);
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerWallet: account,
          title: formData.title,
          description: formData.description,
          priceEth: formData.priceEth,
          imageUrl,
          category: formData.category,
          condition: formData.condition,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Failed to create listing";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (_) {
          errorMsg = `Server error: ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      setUploadProgress(100);
      toast.success("Item listed successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        priceEth: "",
        category: "",
        condition: "new",
      });
      setImageFile(null);
      setImagePreview("");
      setUploadProgress(0);

      // Redirect to marketplace
      setTimeout(() => {
        navigate("/marketplace");
      }, 1500);
    } catch (error) {
      console.error("Error listing item:", error);
      let errorMessage = "Failed to list item";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Try to extract server error message if available
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorMessage;
        }
      } catch (_) {
        // Ignore JSON parse errors
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            List Your Item
          </h1>
          <p className="text-muted-foreground">
            Create a new listing for your tokenized asset
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-input"
                  disabled={loading}
                />
                <label htmlFor="image-input" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="font-medium">Click to upload image</p>
                      <p className="text-sm text-muted-foreground">
                        Max 5MB • JPG, PNG, GIF
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Vintage Leather Handbag"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Fashion, Electronics"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="new">New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (ETH) *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  placeholder="0.5"
                  value={formData.priceEth}
                  onChange={(e) =>
                    setFormData({ ...formData, priceEth: e.target.value })
                  }
                  disabled={loading}
                />
                <span className="absolute right-3 top-3 text-muted-foreground">
                  ETH
                </span>
              </div>
            </div>

            {/* Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                "List Item"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
