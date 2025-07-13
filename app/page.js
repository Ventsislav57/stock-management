"use client";

import HomePage from "@/components/home/Home";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // чакаме сесията
        if (!session) {
            router.push("/login"); // навигация само в useEffect
        }
    }, [session, status, router]);

    if (status === "loading") {
        return <div className="h-screen w-screen"><span className="products-loader"></span></div>;
    }

    if (!session) {
        return null;
    }

    return <HomePage />
}
