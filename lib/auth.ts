import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

/**
 * Refresh the Google OAuth access token using the refresh token
 * Implements aggressive token refresh to prevent authentication failures
 */
async function refreshAccessToken(token: any) {
  try {
    console.log('[NextAuth] Token expired - initiating refresh...');
    console.log('[NextAuth] Token expires at:', new Date(token.accessTokenExpires).toISOString());

    if (!token.refreshToken) {
      throw new Error('No refresh token available');
    }

    const url = 'https://oauth2.googleapis.com/token';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      console.error('[NextAuth] ✗ Token refresh failed:', refreshedTokens);
      throw refreshedTokens;
    }

    console.log('[NextAuth] ✓ Token refreshed successfully');

    const newExpiry = Date.now() + refreshedTokens.expires_in * 1000;
    console.log('[NextAuth] New token expires at:', new Date(newExpiry).toISOString());

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: newExpiry,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error('[NextAuth] ✗ Error refreshing access token:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
      // Force expiry to 0 to trigger re-authentication
      accessTokenExpires: 0,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube.readonly',
          access_type: 'offline', // Critical: Get refresh token
          prompt: 'consent', // Force consent screen to always get refresh token
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, trigger }) {
      console.log('[NextAuth JWT] Callback invoked:', {
        hasAccount: !!account,
        hasUser: !!user,
        trigger,
        hasRefreshToken: !!token.refreshToken,
        tokenError: token.error,
      });

      // Initial sign in
      if (account && user) {
        console.log('[NextAuth] ✓ Initial sign in - storing tokens');
        console.log('[NextAuth] Account data:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
          expiresIn: account.expires_at ? `${account.expires_at - Math.floor(Date.now() / 1000)}s` : 'unknown',
        });

        if (!account.refresh_token) {
          console.error('[NextAuth] ⚠️  WARNING: No refresh token received from Google!');
          console.error('[NextAuth] This will cause authentication loops. Check OAuth settings.');
        }

        const expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000; // Default to 1 hour

        return {
          accessToken: account.access_token,
          accessTokenExpires: expiresAt,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Force refresh on update trigger
      if (trigger === 'update') {
        console.log('[NextAuth] Manual update triggered - forcing token refresh');
        return refreshAccessToken(token);
      }

      // Check if we have a refresh error from previous attempt
      if (token.error === 'RefreshAccessTokenError') {
        console.error('[NextAuth] ✗ Previous refresh failed - returning error state');
        return token; // Return error state to trigger re-login
      }

      // Aggressive token refresh: Refresh 5 minutes before expiry instead of waiting for expiration
      const expiryTime = (token.accessTokenExpires as number) || 0;
      const timeUntilExpiry = expiryTime - Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeUntilExpiry > fiveMinutes) {
        // Token is still valid with more than 5 minutes left
        console.log('[NextAuth] Token still valid, time until expiry:', Math.round(timeUntilExpiry / 1000), 'seconds');
        return token;
      }

      // Check if we have a refresh token before attempting refresh
      if (!token.refreshToken) {
        console.error('[NextAuth] ✗ Cannot refresh - no refresh token available');
        console.error('[NextAuth] This usually means the user needs to re-authenticate');
        return {
          ...token,
          error: 'RefreshAccessTokenError',
          accessTokenExpires: 0,
        };
      }

      // Token is expired or about to expire - refresh it
      console.log('[NextAuth] Token expiring soon or expired - refreshing proactively');
      console.log('[NextAuth] Time until expiry:', Math.round(timeUntilExpiry / 1000), 'seconds');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      console.log('[NextAuth Session] Building session for client:', {
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error,
        expiresAt: token.accessTokenExpires ? new Date(token.accessTokenExpires as number).toISOString() : 'unknown',
      });

      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;

      // Add expiry information for debugging
      if (token.accessTokenExpires) {
        session.expiresAt = token.accessTokenExpires as number;
      }

      return session;
    },
  },
  pages: {
    signIn: '/profile',
    error: '/profile', // Redirect errors to profile page
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
};
