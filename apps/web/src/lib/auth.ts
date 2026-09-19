import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import type { IUserDocument } from "@focus/db/models/user";
import {
  completeTwoFactor,
  findUserForLogin,
} from "@/lib/find-user-for-login";

const githubClientId = process.env.GITHUB_CLIENT_ID || "";
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET || "";
const githubConfigured = Boolean(githubClientId && githubClientSecret);

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
    ...(githubConfigured
      ? [
          GithubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            authorization: {
              params: { scope: "repo read:user user:email" },
            },
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
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
        const email =
          user.email ||
          (profile as { email?: string } | undefined)?.email ||
          (githubLogin ? `${githubLogin}@users.noreply.github.com` : null);

        if (!email && !githubLogin) {
          console.error("[auth] GitHub sign-in missing email and login");
          return false;
        }

        // Prefer linking to the already-signed-in FocusDev account (Connect GitHub).
        let dbUser: IUserDocument | null = null;
        try {
          const existingSession = await getServerSession(authOptions);
          const sessionUserId = (existingSession?.user as { id?: string } | undefined)
            ?.id;
          if (sessionUserId) {
            dbUser = await UserModel.findById(sessionUserId).select(
              "+githubAccessToken githubUsername email name"
            );
          }
        } catch {
          /* no existing session */
        }

        if (!dbUser && email) {
          dbUser = await UserModel.findOne({ email: email.toLowerCase() }).select(
            "+githubAccessToken githubUsername email name"
          );
        }
        if (!dbUser && githubLogin) {
          dbUser = await UserModel.findOne({
            githubUsername: githubLogin.toLowerCase(),
          }).select("+githubAccessToken githubUsername email name");
        }

        if (!dbUser) {
          if (!email) {
            console.error("[auth] GitHub sign-in cannot create user without email");
            return false;
          }
          dbUser = await UserModel.create({
            email: email.toLowerCase(),
            name: user.name || githubLogin,
            githubAccessToken: account.access_token,
            githubUsername: githubLogin,
            lastLoginAt: new Date(),
          });
        } else {
          dbUser.githubAccessToken = account.access_token;
          if (githubLogin) dbUser.githubUsername = githubLogin;
          if (!dbUser.name && user.name) dbUser.name = user.name;
          dbUser.lastLoginAt = new Date();
          await dbUser.save();
        }
        if (!dbUser) return false;
        user.id = dbUser._id.toString();
        user.email = dbUser.email;
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
        token.githubChecked = true;
        // Always refresh token from DB after GitHub link
        if (token.id) {
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
          } catch {
            /* ignore */
          }
        }
      }
      if (token.id && (!token.githubAccessToken || !token.githubChecked)) {
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
        if (session.githubLinked) {
          token.githubChecked = false;
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
        session.user.githubUsername = token.githubUsername as
          | string
          | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
