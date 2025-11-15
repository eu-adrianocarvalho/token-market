import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../db";

// Create a new listing
export const handleCreateListing: RequestHandler = async (req, res) => {
  try {
    const {
      sellerWallet,
      title,
      description,
      priceEth,
      imageUrl,
      category,
      condition,
      tokenId,
    } = req.body;

    if (!sellerWallet || !title || !priceEth) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get seller user ID
    const seller = await dbGet(
      "SELECT id FROM users WHERE wallet_address = $1",
      [sellerWallet],
    );

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Create listing
    const result = await dbRun(
      `INSERT INTO listings (
        token_id, seller_wallet, seller_id, title, description, 
        price_eth, image_url, category, condition, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true) RETURNING id`,
      [
        tokenId || null,
        sellerWallet,
        seller.id,
        title,
        description || null,
        priceEth,
        imageUrl || null,
        category || null,
        condition || null,
      ],
    );

    console.log(result);

    const newListing = await dbGet("SELECT * FROM listings WHERE id = $1", [
      result.id,
    ]);

    res.status(201).json({
      id: newListing.id,
      tokenId: newListing.token_id,
      sellerWallet: newListing.seller_wallet,
      title: newListing.title,
      description: newListing.description,
      priceEth: newListing.price_eth,
      imageUrl: newListing.image_url,
      category: newListing.category,
      condition: newListing.condition,
      isActive: newListing.is_active,
      createdAt: newListing.created_at,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ error: "Failed to create listing" });
  }
};

// Get all active listings
export const handleGetListings: RequestHandler = async (req, res) => {
  try {
    const listings = await dbAll(
      `SELECT * FROM listings WHERE is_active = true ORDER BY created_at DESC`,
    );

    const formattedListings = listings.map((listing: any) => ({
      id: listing.id,
      tokenId: listing.token_id,
      sellerWallet: listing.seller_wallet,
      title: listing.title,
      description: listing.description,
      priceEth: listing.price_eth,
      imageUrl: listing.image_url,
      category: listing.category,
      condition: listing.condition,
      isActive: listing.is_active,
      createdAt: listing.created_at,
    }));

    res.json(formattedListings);
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({ error: "Failed to get listings" });
  }
};

// Get listings by seller
export const handleGetSellerListings: RequestHandler = async (req, res) => {
  try {
    const { sellerWallet } = req.params;

    const listings = await dbAll(
      "SELECT * FROM listings WHERE seller_wallet = $1 ORDER BY created_at DESC",
      [sellerWallet],
    );

    const formattedListings = listings.map((listing: any) => ({
      id: listing.id,
      tokenId: listing.token_id,
      sellerWallet: listing.seller_wallet,
      title: listing.title,
      description: listing.description,
      priceEth: listing.price_eth,
      imageUrl: listing.image_url,
      category: listing.category,
      condition: listing.condition,
      isActive: listing.is_active,
      createdAt: listing.created_at,
    }));

    res.json(formattedListings);
  } catch (error) {
    console.error("Get seller listings error:", error);
    res.status(500).json({ error: "Failed to get seller listings" });
  }
};

// Get listing by ID
export const handleGetListing: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await dbGet("SELECT * FROM listings WHERE id = $1", [id]);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({
      id: listing.id,
      tokenId: listing.token_id,
      sellerWallet: listing.seller_wallet,
      title: listing.title,
      description: listing.description,
      priceEth: listing.price_eth,
      imageUrl: listing.image_url,
      category: listing.category,
      condition: listing.condition,
      isActive: listing.is_active,
      createdAt: listing.created_at,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({ error: "Failed to get listing" });
  }
};

// Update listing
export const handleUpdateListing: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priceEth, category, condition } = req.body;

    const listing = await dbGet("SELECT * FROM listings WHERE id = $1", [id]);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    await dbRun(
      `UPDATE listings SET 
        title = $1, description = $2, price_eth = $3, category = $4, condition = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        title || listing.title,
        description !== undefined ? description : listing.description,
        priceEth || listing.price_eth,
        category || listing.category,
        condition || listing.condition,
        id,
      ],
    );

    const updatedListing = await dbGet("SELECT * FROM listings WHERE id = $1", [
      id,
    ]);

    res.json({
      id: updatedListing.id,
      tokenId: updatedListing.token_id,
      sellerWallet: updatedListing.seller_wallet,
      title: updatedListing.title,
      description: updatedListing.description,
      priceEth: updatedListing.price_eth,
      imageUrl: updatedListing.image_url,
      category: updatedListing.category,
      condition: updatedListing.condition,
      isActive: updatedListing.is_active,
      createdAt: updatedListing.created_at,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
};

// Delete/deactivate listing
export const handleDeleteListing: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await dbGet("SELECT * FROM listings WHERE id = $1", [id]);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    await dbRun(
      "UPDATE listings SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    );

    res.json({ message: "Listing deactivated successfully" });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
};
