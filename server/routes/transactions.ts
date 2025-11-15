import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../db";

// Create a transaction record
export const handleCreateTransaction: RequestHandler = async (req, res) => {
  try {
    const { tokenId, sellerWallet, buyerWallet, listingId, priceEth, txHash } =
      req.body;

    if (!tokenId || !sellerWallet || !buyerWallet || !priceEth) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await dbRun(
      `INSERT INTO transactions (token_id, seller_wallet, buyer_wallet, listing_id, price_eth, tx_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING id`,
      [
        tokenId,
        sellerWallet,
        buyerWallet,
        listingId || null,
        priceEth,
        txHash || null,
      ],
    );

    console.log(result);

    const newTransaction = await dbGet(
      "SELECT * FROM transactions WHERE id = $1",
      [result.id],
    );

    res.status(201).json({
      id: newTransaction.id,
      tokenId: newTransaction.token_id,
      sellerWallet: newTransaction.seller_wallet,
      buyerWallet: newTransaction.buyer_wallet,
      listingId: newTransaction.listing_id,
      priceEth: newTransaction.price_eth,
      txHash: newTransaction.tx_hash,
      status: newTransaction.status,
      createdAt: newTransaction.created_at,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

// Get transaction by hash
export const handleGetTransaction: RequestHandler = async (req, res) => {
  try {
    const { txHash } = req.params;

    const transaction = await dbGet(
      "SELECT * FROM transactions WHERE tx_hash = $1",
      [txHash],
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      id: transaction.id,
      tokenId: transaction.token_id,
      sellerWallet: transaction.seller_wallet,
      buyerWallet: transaction.buyer_wallet,
      listingId: transaction.listing_id,
      priceEth: transaction.price_eth,
      txHash: transaction.tx_hash,
      status: transaction.status,
      createdAt: transaction.created_at,
      completedAt: transaction.completed_at,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ error: "Failed to get transaction" });
  }
};

// Update transaction status
export const handleUpdateTransactionStatus: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const transaction = await dbGet(
      "SELECT * FROM transactions WHERE id = $1",
      [id],
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const completedAt =
      status === "completed" ? new Date().toISOString() : null;

    await dbRun(
      "UPDATE transactions SET status = $1, completed_at = $2 WHERE id = $3",
      [status, completedAt, id],
    );

    const updatedTransaction = await dbGet(
      "SELECT * FROM transactions WHERE id = $1",
      [id],
    );

    res.json({
      id: updatedTransaction.id,
      tokenId: updatedTransaction.token_id,
      sellerWallet: updatedTransaction.seller_wallet,
      buyerWallet: updatedTransaction.buyer_wallet,
      listingId: updatedTransaction.listing_id,
      priceEth: updatedTransaction.price_eth,
      txHash: updatedTransaction.tx_hash,
      status: updatedTransaction.status,
      createdAt: updatedTransaction.created_at,
      completedAt: updatedTransaction.completed_at,
    });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

// Get user transactions (both buyer and seller)
export const handleGetUserTransactions: RequestHandler = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const transactions = await dbAll(
      `SELECT * FROM transactions 
       WHERE seller_wallet = $1 OR buyer_wallet = $2 
       ORDER BY created_at DESC`,
      [walletAddress, walletAddress],
    );

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      tokenId: tx.token_id,
      sellerWallet: tx.seller_wallet,
      buyerWallet: tx.buyer_wallet,
      listingId: tx.listing_id,
      priceEth: tx.price_eth,
      txHash: tx.tx_hash,
      status: tx.status,
      createdAt: tx.created_at,
      completedAt: tx.completed_at,
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({ error: "Failed to get transactions" });
  }
};
