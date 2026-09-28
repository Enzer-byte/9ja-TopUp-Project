import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined });
export async function tx<T>(work: (client: any) => Promise<T>) { const client = await pool.connect(); try { await client.query('BEGIN'); const value = await work(client); await client.query('COMMIT'); return value; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); } }
