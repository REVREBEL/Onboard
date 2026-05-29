import pkg from "pg";

const { Pool } = pkg;

const isVaultPlaceholder = (value) =>
  typeof value === "string" && value.startsWith("op://");

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

if (process.env.PGSSL === "true") {
  connectionConfig.ssl = { rejectUnauthorized: false };
}

if (isVaultPlaceholder(connectionConfig.password)) {
  delete connectionConfig.password;
}

export const pool = new Pool(connectionConfig);
