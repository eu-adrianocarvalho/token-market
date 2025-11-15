import { RequestHandler } from "express";
import { dbRun, dbGet, dbAll } from "../db";

// Register or login user with wallet
export const handleAuthWallet: RequestHandler = async (req, res) => {
  try {
    const { walletAddress, userType } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    if (!["seller", "buyer", "both"].includes(userType)) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    // Check if user exists
    const existingUser = await dbGet(
      "SELECT * FROM users WHERE wallet_address = $1",
      [walletAddress],
    );

    if (existingUser) {
      // Update user type if needed
      if (existingUser.user_type !== userType) {
        await dbRun(
          "UPDATE users SET user_type = $1, updated_at = CURRENT_TIMESTAMP WHERE wallet_address = $2",
          [userType, walletAddress],
        );
      }
      return res.json({
        user: {
          id: existingUser.id,
          walletAddress: existingUser.wallet_address,
          userType: existingUser.user_type,
          username: existingUser.username,
          email: existingUser.email,
          avatarUrl: existingUser.avatar_url,
          bio: existingUser.bio,
        },
      });
    }

    // Create new user
    const result = await dbRun(
      "INSERT INTO users (wallet_address, user_type) VALUES ($1, $2) RETURNING id",
      [walletAddress, userType],
    );

    return res.status(201).json({
      user: {
        id: result.id,
        walletAddress,
        userType,
        username: null,
        email: null,
        avatarUrl: null,
        bio: null,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Get user profile
export const handleGetUser: RequestHandler = async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const user = await dbGet("SELECT * FROM users WHERE wallet_address = $1", [
      walletAddress,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      walletAddress: user.wallet_address,
      userType: user.user_type,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
      bio: user.bio,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
};

// Update user profile
export const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { username, email, bio, avatarUrl } = req.body;

    const user = await dbGet("SELECT * FROM users WHERE wallet_address = $1", [
      walletAddress,
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await dbRun(
      `UPDATE users 
       SET username = $1, email = $2, bio = $3, avatar_url = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE wallet_address = $5`,
      [
        username || user.username,
        email || user.email,
        bio || user.bio,
        avatarUrl || user.avatar_url,
        walletAddress,
      ],
    );

    const updatedUser = await dbGet(
      "SELECT * FROM users WHERE wallet_address = $1",
      [walletAddress],
    );

    res.json({
      id: updatedUser.id,
      walletAddress: updatedUser.wallet_address,
      userType: updatedUser.user_type,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatar_url,
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};
