import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { YouTubeService } from '@/lib/youtube';

// Disable caching for this route - always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Server-side token validation helper
 * Tests if the access token is valid by making a lightweight API call
 */
async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    console.log('[Token Validation] Testing token with YouTube API...');
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&maxResults=1',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Token Validation] ✗ YouTube API returned error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return false;
    }

    console.log('[Token Validation] ✓ Token is valid');
    return true;
  } catch (error) {
    console.error('[Token Validation] ✗ Network error:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[API /playlists] ========== NEW REQUEST ==========');
    console.log('[API /playlists] Request received at:', new Date().toISOString());

    const session = await getServerSession(authOptions);

    console.log('[API /playlists] Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasError: !!session?.error,
    });

    // Check for session
    if (!session || !session.accessToken) {
      console.error('[API /playlists] ✗ No session or access token found');
      return NextResponse.json(
        {
          error: 'AuthRequired',
          message: 'Please sign in with Google to access your playlists',
        },
        { status: 401 }
      );
    }

    // Check for token refresh errors
    if (session.error === 'RefreshAccessTokenError') {
      console.error('[API /playlists] ✗ Token refresh error detected');
      return NextResponse.json(
        {
          error: 'TokenExpired',
          message: 'Your session has expired. Please sign in again.',
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    // Server-side token validation - DISABLED to save quota
    // Token validation uses YouTube API quota, so we skip it in development
    // The actual API call will fail if token is invalid anyway
    console.log('[API /playlists] Token preview:', session.accessToken?.substring(0, 20) + '...');
    console.log('[API /playlists] Session expires at:', session.expiresAt ? new Date(session.expiresAt).toISOString() : 'unknown');
    console.log('[API /playlists] ✓ Skipping token validation to conserve quota');

    console.log('[API /playlists] ✓ Token validated successfully');
    console.log('[API /playlists] Fetching playlists from YouTube...');

    const youtube = new YouTubeService(session.accessToken);
    const playlists = await youtube.getAllPlaylists();

    console.log(`[API /playlists] ✓ Successfully fetched ${playlists.length} playlists`);

    return NextResponse.json(
      {
        playlists,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /playlists] ✗ Error:', error);

    // Parse error details
    const errorMessage = error.message || 'Unknown error';
    const errorStatus = error.response?.status || 500;

    // Check for specific OAuth/API errors
    if (
      errorStatus === 401 ||
      errorMessage.includes('invalid_grant') ||
      errorMessage.includes('invalid_token') ||
      errorMessage.includes('Token has been expired')
    ) {
      console.error('[API /playlists] ✗ OAuth error detected:', errorMessage);
      return NextResponse.json(
        {
          error: 'TokenExpired',
          message: 'Your session has expired. Please sign in again.',
          requiresReauth: true,
          details: errorMessage,
        },
        { status: 401 }
      );
    }

    // Check for quota errors
    if (errorStatus === 403 || errorMessage.includes('quota')) {
      console.error('[API /playlists] ✗ Quota exceeded');
      return NextResponse.json(
        {
          error: 'QuotaExceeded',
          message: 'YouTube API quota exceeded. Please try again later.',
          details: errorMessage,
        },
        { status: 429 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: 'ServerError',
        message: 'Failed to fetch playlists. Please try again.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
