import NextAuth, { CredentialsSignin, type DefaultSession } from "next-auth";
import Github from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db/index";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { signInSchema } from "./lib/validate";

export class CustomError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
    this.message = code;
    this.stack = undefined;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        if(!credentials.email || !credentials.password) {
          throw new CustomError("Invalid Credentials Account");
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toString()))
          .limit(1)

        if(user.length === 0) {
          throw new CustomError("Invalid Email Account")
        }

        const isPasswordValid = await compare(
          credentials.password.toString(),
          user[0].password ?? ''
        )

        if(!isPasswordValid) {
          throw new CustomError("Invalid Password Account")
        }

        return user[0]
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name; 
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.id, user.id as string))

        token.role = existingUser[0].role
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session
    },
  },
});
