import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.CONNECTION_STRING;
const client = new MongoClient(uri);

async function findUserByUsernameAndPassword(username, password) {
    try {
        await client.connect();
        const db = client.db("test");
        const user = await db.collection("admins").findOne({ username });
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
            id: user._id.toString(),
            name: user.name || username,
            email: user.email || null,
        };
    } finally {
        await client.close();
    }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            username: {
            label: "Потребителско име",
            type: "text",
            placeholder: "Потребителско име",
            },
            password: { label: "Парола", type: "password", placeholder: "Парола" },
        },
        async authorize(credentials) {
            console.log("Credentials received:", credentials);
            const user = await findUserByUsernameAndPassword(credentials.username, credentials.password);
            console.log("User found:", user);
            if (user) return user;
            console.log("Authorization failed");
            return null;
        }

    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
