import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { connectToDatabase } from "@focus/db";
import { UserModel } from "@focus/db/models";
import { findUserForLogin } from "@/lib/find-user-for-login";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await findUserForLogin(credentials.email, credentials.password);

        if (!user) {
          throw new Error("Invalid credentials");
        }

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
      authorization: { params: { scope: 'repo read:user user:email' } }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        await connectToDatabase();
        let dbUser = await UserModel.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await UserModel.create({
            email: user.email,
            name: user.name,
            githubAccessToken: account.access_token,
          });
        } else {
          dbUser.githubAccessToken = account.access_token;
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
      // Support session.update({ name }) from Settings Profile
      if (trigger === "update" && session?.name !== undefined) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.githubAccessToken = token.githubAccessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
