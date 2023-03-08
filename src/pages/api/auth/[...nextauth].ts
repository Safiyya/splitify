import { GRANT_TYPE_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import NextAuth, { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import SpotifyProvider from "next-auth/providers/spotify";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  try {
    const body = new URLSearchParams();
    body.append(GRANT_TYPE_KEY, REFRESH_TOKEN_KEY);
    body.append(REFRESH_TOKEN_KEY, token.refreshToken);
    body.append(GRANT_TYPE_KEY, "authorization_code");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const refreshedTokens = await response.json();
    var { access_token, expires_in, refresh_token } = refreshedTokens;

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      accessToken: access_token,
      accessTokenExpires: Date.now() + expires_in * 1000,
      refreshToken: refresh_token ?? token.refreshToken, // Fall back to old refresh token
      user: token.user,
    };
  } catch (error) {
    console.error(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.CLIENT_ID || "",
      clientSecret: process.env.CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: process.env.SPOTIFY_SCOPES,
        },
      },
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log("Signing in");
        return {
          user,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_at || 0) * 1000,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token as any).accessTokenExpires) {
        console.log("Access token still valid");
        return {
          user: token.user,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          accessTokenExpires: token.accessTokenExpires,
        };
      }

      // Access token has expired, try to update it
      console.log("Get refresh token");
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
};

export default NextAuth(authOptions);
