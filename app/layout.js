'use client';
import "./globals.css";
import { SessionProvider } from "next-auth/react";



export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>

            </head>
            <body>
                <main>
                    <SessionProvider>
                        {children}
                    </SessionProvider>
                </main>
            </body>
        </html>
    );
}
