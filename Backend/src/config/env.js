import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure .env is loaded before any other modules that might use process.env
dotenv.config({ path: join(__dirname, '../.env') });

console.log('✅ Environment variables loaded');
