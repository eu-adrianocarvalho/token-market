import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { handleDemo } from "./routes/demo";
import { handleAuthWallet, handleGetUser, handleUpdateUser } from "./routes/auth";
import {
  handleCreateListing,
  handleGetListings,
  handleGetSellerListings,
  handleGetListing,
  handleUpdateListing,
  handleDeleteListing,
} from "./routes/listings";
import { handleUpload, upload } from "./routes/uploads";
import {
  handleCreateTransaction,
  handleGetTransaction,
  handleUpdateTransactionStatus,
  handleGetUserTransactions,
} from "./routes/transactions";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createServer() {
  const app = express();

  // Initialize database (lazy-load to avoid loading native modules at config time)
  const { initializeDatabase } = await import("./db");
  await initializeDatabase();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (including uploads)
  app.use(express.static(path.join(__dirname, "../public")));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/wallet", handleAuthWallet);
  app.get("/api/users/:walletAddress", handleGetUser);
  app.put("/api/users/:walletAddress", handleUpdateUser);

  // Listings routes
  app.post("/api/listings", handleCreateListing);
  app.get("/api/listings", handleGetListings);
  app.get("/api/listings/:id", handleGetListing);
  app.put("/api/listings/:id", handleUpdateListing);
  app.delete("/api/listings/:id", handleDeleteListing);
  app.get("/api/sellers/:sellerWallet/listings", handleGetSellerListings);

  // File upload route
  app.post("/api/upload", upload.single("file"), handleUpload);

  // Transaction routes
  app.post("/api/transactions", handleCreateTransaction);
  app.get("/api/transactions/:txHash", handleGetTransaction);
  app.put("/api/transactions/:id/status", handleUpdateTransactionStatus);
  app.get("/api/users/:walletAddress/transactions", handleGetUserTransactions);

  return app;
}
