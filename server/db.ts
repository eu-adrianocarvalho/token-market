import { Pool } from "pg";
import "dotenv/config";

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "tokenmarket",
  user: process.env.DB_USER || "tokenmarket",
  password: process.env.DB_PASSWORD || "tokenmarket123",
});

// Handle connection errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Execute a query that returns rows
 */
export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const result = await pool.query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Get a single row from the database
 */
export async function dbGet(sql: string, params: any[] = []): Promise<any> {
  try {
    const result = await pool.query(sql, params);
    return result.rows?.[0] || null;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Execute a query (INSERT, UPDATE, DELETE)
 */
export async function dbRun(sql: string, params: any[] = []): Promise<any> {
  try {
    const result = await pool.query(sql, params);
    return {
      id: result.rows?.[0]?.id,
      changes: result.rowCount || 0,
    };
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Initialize database - verify connection
 */
export async function initializeDatabase() {
  try {
    // Test connection
    const result = await pool.query("SELECT NOW()");
    console.log("✓ PostgreSQL database connected");
    return true;
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  try {
    await pool.end();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }
}

export { pool };
