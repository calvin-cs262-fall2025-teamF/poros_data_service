
import { query } from '../src/config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const addFileUriColumn = async () => {
    try {
        console.log('Adding file_uri column to tailored_resumes table...');

        await query(`
            ALTER TABLE tailored_resumes 
            ADD COLUMN IF NOT EXISTS file_uri TEXT;
        `);

        console.log('Successfully added file_uri column.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        process.exit();
    }
};

addFileUriColumn();
