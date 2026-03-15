const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.argv[2];

if (!connectionString) {
  console.error("Please provide the DATABASE_URL as an environment variable or argument.");
  console.error("Usage: node migrate.js <DATABASE_URL>");
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to the database on Railway.");

    const initSqlPath = path.join(__dirname, '../../migrations/001_init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    console.log(`Running 001_init.sql...`);
    await client.query(initSql);
    console.log(`001_init.sql completed.`);

    const seedSqlPath = path.join(__dirname, '../../migrations/002_seed.sql');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
    console.log(`Running 002_seed.sql...`);
    await client.query(seedSql);
    console.log(`002_seed.sql completed.`);

    console.log("All migrations executed successfully.");
  } catch (error) {
    console.error("Error executing migrations:", error);
  } finally {
    await client.end();
  }
}

runMigrations();
