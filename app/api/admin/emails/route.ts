import { NextRequest, NextResponse } from 'next/server';
import { getAllEmails, getEmailCount, getRecentEmails } from '@/lib/db';

// Simple authentication - you should use proper auth in production
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'change-me-in-production';

export async function GET(request: NextRequest) {
  try {
    // Check admin key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (apiKey !== ADMIN_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const format = searchParams.get('format'); // 'json' or 'csv'

    let emails;
    if (limit) {
      emails = getRecentEmails(parseInt(limit));
    } else {
      emails = getAllEmails();
    }

    const count = getEmailCount();

    // Return CSV format if requested
    if (format === 'csv') {
      const csv = [
        'ID,Email,Source,Created At,IP Address',
        ...emails.map(e =>
          `${e.id},"${e.email}","${e.source}","${e.created_at}","${e.ip_address}"`
        )
      ].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="emails-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      count,
      emails,
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
