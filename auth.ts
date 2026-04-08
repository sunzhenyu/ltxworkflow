import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email!)
          .single();
        if (!data) {
          await supabase.from("users").insert({
            email: user.email,
            name: user.name,
            avatar_url: user.image,
            provider: "google",
          });
        }
      }
      return true;
    },
    async session({ session }) {
      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email!)
        .single();
      if (data) session.user.id = data.id;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
