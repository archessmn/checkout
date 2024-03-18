import { PrismaAdapter } from "./adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";

import { env } from "@/env";
import { db } from "@/server/db";
import type { Adapter } from "next-auth/adapters";
import type { GetServerSidePropsContext } from "next";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    {
      id: "kanidm",
      name: "SSO",
      type: "oauth",
      wellKnown: env.OAUTH_ISSUER_URL,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      clientId: env.OAUTH_CLIENT_ID,
      clientSecret: env.OAUTH_CLIENT_SECRET,
      idToken: true,
      client: {
        authorization_signed_response_alg: "ES256",
        id_token_signed_response_alg: "ES256",
      },
      profile(profile: {
        sub: string;
        name: string | undefined;
        email: string;
      }) {
        return {
          id: profile.sub,
          name: profile?.name,
          email: profile.email,
        };
      },
    },
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

export const getPagesServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
