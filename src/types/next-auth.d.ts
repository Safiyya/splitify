/* eslint-disable unused-imports/no-unused-vars */
import { User } from "next-auth";

/** Example on how to extend the built-in session types */
declare module "next-auth" {
  interface Session {
    /** This is an example. You can find me in types/next-auth.d.ts */
    user: User;
    accessToken: string;
    error?: string | Error;
  }
}

/** Example on how to extend the built-in types for JWT */
declare module "next-auth/jwt" {
  interface JWT {
    /** This is an example. You can find me in types/next-auth.d.ts */
    user: User;
    accessToken: string;
    refreshToken: string;
    error?: string | Error;
    accessTokenExpires: number;
  }
}
