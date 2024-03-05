import type { PrismaClient, Prisma } from "@prisma/client";
import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
} from "@auth/core/adapters";

// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// export { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     Google,
//   ],
// })

/**
 * ## Setup
 *
 * Add this adapter to your `auth.ts` Auth.js configuration object:
 *
 * ```js title="auth.ts"
 * import NextAuth from "next-auth"
 * import Google from "next-auth/providers/google"
 * import { PrismaAdapter } from "@auth/prisma-adapter"
 * import { PrismaClient } from "@prisma/client"
 *
 * const prisma = new PrismaClient()
 *
 * export { handlers, auth, signIn, signOut } = NextAuth({
 *   adapter: PrismaAdapter(prisma),
 *   providers: [
 *     Google,
 *   ],
 * })
 * ```
 **/
export function PrismaAdapter(
  prisma: PrismaClient | ReturnType<PrismaClient["$extends"]>,
): Adapter {
  const p = prisma as PrismaClient;
  return {
    // We need to let Prisma generate the ID because our default UUID is incompatible with MongoDB
    createUser: ({ id: _id, ...data }) => {
      console.log({ _id, ...data });
      return p.user.create({ data }) as Promise<AdapterUser>;
    },
    getUser: (id) => {
      console.log(id);
      return p.user.findUnique({
        where: { id },
      }) as Promise<AdapterUser | null>;
    },
    getUserByEmail: (email) => {
      return p.user.findUnique({
        where: { email },
      }) as Promise<AdapterUser | null>;
    },
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return (account?.user as AdapterUser) ?? null;
    },
    updateUser: ({ id, ...data }) => {
      return p.user.update({ where: { id }, data }) as Promise<AdapterUser>;
    },
    deleteUser: (id) => {
      return p.user.delete({ where: { id } }) as Promise<AdapterUser>;
    },
    linkAccount: (data) => {
      return p.account.create({ data }) as unknown as AdapterAccount;
    },
    unlinkAccount: (provider_providerAccountId) => {
      return p.account.delete({
        where: { provider_providerAccountId },
      }) as unknown as AdapterAccount;
    },
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session } as {
        user: AdapterUser;
        session: AdapterSession;
      };
    },
    createSession: (data) => {
      return p.session.create({ data });
    },
    updateSession: (data) => {
      return p.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },
    deleteSession: (sessionToken) => {
      return p.session.delete({ where: { sessionToken } });
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
    async getAccount(providerAccountId, provider) {
      return p.account.findFirst({
        where: { providerAccountId, provider },
      }) as Promise<AdapterAccount | null>;
    },
    // async createAuthenticator(authenticator) {
    //   return p.verificationToken
    //     .create({
    //       data: authenticator,
    //     })
    //     .then(verificationToken);
    // },
    // async getAuthenticator(credentialID) {
    //   const authenticator = await p.verificationToken.findUnique({
    //     where: { credentialID },
    //   });
    //   return authenticator ? fromDBAuthenticator(authenticator) : null;
    // },
    // async listAuthenticatorsByUserId(userId) {
    //   const authenticators = await p.verificationToken.findMany({
    //     where: {  },
    //   });

    //   return authenticators.map(verificationToken);
    // },
    // async updateAuthenticatorCounter(credentialID, counter) {
    //   return p.verificationToken
    //     .update({
    //       where: { credentialID: credentialID },
    //       data: { counter },
    //     })
    //     .then(fromDBAuthenticator);
    // },
  };
}
