import pkg from "pg";

const { Pool } = pkg;

const isVaultPlaceholder = (value) =>
  typeof value === "string" && value.startsWith("op://");

const requiresRelaxedSsl = (connectionString) => {
  if (process.env.PGSSL === "true") return true;
  if (!connectionString || isVaultPlaceholder(connectionString)) return false;

  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");
    return ["require", "prefer", "verify-ca", "verify-full"].includes(sslMode);
  } catch {
    return false;
  }
};

const connectionConfig = {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: Number(process.env.PGPOOL_MAX || 5),
  idleTimeoutMillis: 30000
};

if (process.env.DATABASE_URL && !isVaultPlaceholder(process.env.DATABASE_URL)) {
  connectionConfig.connectionString = process.env.DATABASE_URL;
}

if (requiresRelaxedSsl(connectionConfig.connectionString)) {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

if (isVaultPlaceholder(connectionConfig.password)) {
  delete connectionConfig.password;
}

export const pool = new Pool(connectionConfig);
