import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'emails.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS email_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_page',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_email ON email_subscribers(email);
  CREATE INDEX IF NOT EXISTS idx_created_at ON email_subscribers(created_at);
`);

export interface EmailSubscriber {
  id?: number;
  email: string;
  source?: string;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

export function saveEmail(data: EmailSubscriber): { success: boolean; id?: number; error?: string } {
  try {
    const stmt = db.prepare(`
      INSERT INTO email_subscribers (email, source, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.email,
      data.source || 'landing_page',
      data.ip_address || null,
      data.user_agent || null
    );

    return { success: true, id: Number(result.lastInsertRowid) };
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Email already subscribed' };
    }
    console.error('Error saving email:', error);
    return { success: false, error: 'Failed to save email' };
  }
}

export function getAllEmails(): EmailSubscriber[] {
  const stmt = db.prepare('SELECT * FROM email_subscribers ORDER BY created_at DESC');
  return stmt.all() as EmailSubscriber[];
}

export function getEmailCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM email_subscribers');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getRecentEmails(limit: number = 10): EmailSubscriber[] {
  const stmt = db.prepare('SELECT * FROM email_subscribers ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as EmailSubscriber[];
}

export default db;
