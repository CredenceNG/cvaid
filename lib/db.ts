import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not set - database features will be disabled');
}

// Create SQL client
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export interface EmailSubscriber {
  id?: number;
  email: string;
  source?: string;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// Initialize database table (create if not exists)
export async function initDatabase() {
  if (!sql) return false;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        source TEXT DEFAULT 'landing_page',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_email ON email_subscribers(email)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_created_at ON email_subscribers(created_at)
    `;

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

export async function saveEmail(data: EmailSubscriber): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!sql) {
    return { success: false, error: 'Database not configured' };
  }

  try {
    const result = await sql`
      INSERT INTO email_subscribers (email, source, ip_address, user_agent)
      VALUES (${data.email}, ${data.source || 'landing_page'}, ${data.ip_address || null}, ${data.user_agent || null})
      RETURNING id
    `;

    return { success: true, id: result[0].id };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return { success: false, error: 'Email already subscribed' };
    }
    console.error('Error saving email:', error);
    return { success: false, error: 'Failed to save email' };
  }
}

export async function getAllEmails(): Promise<EmailSubscriber[]> {
  if (!sql) return [];

  try {
    const result = await sql`
      SELECT * FROM email_subscribers ORDER BY created_at DESC
    `;
    return result as EmailSubscriber[];
  } catch (error) {
    console.error('Error getting emails:', error);
    return [];
  }
}

export async function getEmailCount(): Promise<number> {
  if (!sql) return 0;

  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM email_subscribers
    `;
    return Number(result[0].count);
  } catch (error) {
    console.error('Error getting email count:', error);
    return 0;
  }
}

export async function getRecentEmails(limit: number = 10): Promise<EmailSubscriber[]> {
  if (!sql) return [];

  try {
    const result = await sql`
      SELECT * FROM email_subscribers ORDER BY created_at DESC LIMIT ${limit}
    `;
    return result as EmailSubscriber[];
  } catch (error) {
    console.error('Error getting recent emails:', error);
    return [];
  }
}

export default sql;
