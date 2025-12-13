
import { query } from '../src/config/database';

async function migrate() {
    try {
        console.log('Adding application_timeline column...');
        await query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS application_timeline JSONB;
    `);
        console.log('Column added successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
