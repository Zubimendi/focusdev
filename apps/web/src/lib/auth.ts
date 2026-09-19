import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import {
  completeTwoFactor,
  findUserForLogin,
} from "@/lib/find-user-for-login";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
        backupCode: { label: "Backup Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await findUserForLogin(
          credentials.email,
          credentials.password
        );

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (user.twoFactorEnabled) {
          if (!credentials.totpCode && !credentials.backupCode) {
            throw new Error("2FA_REQUIRED");
          }
          const ok = await completeTwoFactor(user, {
            totpCode: credentials.totpCode || undefined,
            backupCode: credentials.backupCode || undefined,
          });
          if (!ok) {
            throw new Error("Invalid credentials");
          }
        }

        await UserModel.findByIdAndUpdate(user.id, {
          lastLoginAt: new Date(),
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: { params: { scope: "repo read:user user:email" } },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        await connectToDatabase();
        const githubLogin =
          (profile as { login?: string } | undefined)?.login || undefined;
        let dbUser = await UserModel.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await UserModel.create({
            email: user.email,
            name: user.name,
            githubAccessToken: account.access_token,
            githubUsername: githubLogin,
          });
        } else {
          dbUser.githubAccessToken = account.access_token;
          if (githubLogin) dbUser.githubUsername = githubLogin;
          await dbUser.save();
        }
        user.id = dbUser._id.toString();
        return true;
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      if (account?.provider === "github") {
        token.githubAccessToken = account.access_token;
      }
      // Credentials sessions: hydrate GitHub token from DB once
      if (token.id && !token.githubAccessToken && !token.githubChecked) {
        try {
          await connectToDatabase();
          const dbUser = await UserModel.findById(token.id as string).select(
            "+githubAccessToken githubUsername"
          );
          if (dbUser?.githubAccessToken) {
            token.githubAccessToken = dbUser.githubAccessToken;
          }
          if (dbUser?.githubUsername) {
            token.githubUsername = dbUser.githubUsername;
          }
          token.githubChecked = true;
        } catch {
          token.githubChecked = true;
        }
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.onboardingCompletedAt !== undefined) {
          token.onboardingCompletedAt = session.onboardingCompletedAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.githubAccessToken = token.githubAccessToken as string;
        session.user.githubUsername = token.githubUsername as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
