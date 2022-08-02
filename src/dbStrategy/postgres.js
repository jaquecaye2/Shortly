import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const connection = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'shortly-database'
});

/*const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});*/

export default connection;
