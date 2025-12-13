
import { query } from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add file_data column to resumes table
        await query(`
      ALTER TABLE resumes 
      ADD COLUMN IF NOT EXISTS file_data BYTEA;
    `);
        console.log('Added file_data to resumes table');

        // Add file_data column to tailored_resumes table
        await query(`
      ALTER TABLE tailored_resumes 
      ADD COLUMN IF NOT EXISTS file_data BYTEA;
    `);
        console.log('Added file_data to tailored_resumes table');

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
