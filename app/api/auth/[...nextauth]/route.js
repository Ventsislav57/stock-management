import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

async function findUserByUsernameAndPassword(username, password) {
    const user = await prisma.users.findUnique({
        where: { username },
    });

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;
    
    return {
        id: user.id,
        name: user.full_name,
        email: null,
    };
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Потребителско име", type: "text" },
                password: { label: "Парола", type: "password" },
            },
            async authorize(credentials) {
                const user = await findUserByUsernameAndPassword(
                    credentials.username,
                    credentials.password
                );
            
                if (user) return user;
                return null;
            }
            
        }),
    ],

    session: { strategy: "jwt" },

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token) session.user.id = token.id;
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },
});

export { handler as GET, handler as POST };
