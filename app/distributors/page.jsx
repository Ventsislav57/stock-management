"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideNav from "@/components/navigation/SideNav";

export default function DistributorsPage() {
    const [list, setList] = useState([]);

    useEffect(() => {
        fetch("/api/distributors")
            .then((res) => res.json())
            .then((result) => setList(result.items));
    }, []);

    return (
        <section className="h-screen w-screen text-white flex flex-col md:flex-row">
            <SideNav />

            <div className="p-10 text-white w-full">

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 ovreflow-y-auto">
                    <div className="flex justify-between items-center mb-6 border-b-2 pb-4">
                        <h1 className="text-3xl font-bold">Дистрибутори</h1>

                        <Link
                            href="/distributors/new"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                            + Нов дистрибутор
                        </Link>
                    </div>

                    <div className="grid grid-cols-12 gap-4 w-full h-[calc(100vh-200px)] overflow-y-auto pr-7">
                        {/* Header */}
                        <div className="col-span-12 grid grid-cols-12 text-gray-300 border-b border-gray-400 pb-2">
                            <div className="col-span-2 font-semibold">Име</div>
                            <div className="col-span-2 font-semibold">Булстат</div>
                            <div className="col-span-3 font-semibold">Град</div>
                            <div className="col-span-2 font-semibold">Телефон</div>
                            <div className="col-span-2 font-semibold">Имейл адрес</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Rows */}
                        {list?.map((d) => (
                            <div
                                key={d.id}
                                className="col-span-12 grid grid-cols-12 items-center border-b border-gray-700 py-3"
                            >
                                <div className="col-span-2">{d.name}</div>
                                <div className="col-span-2">{d.bulstat}</div>
                                <div className="col-span-3">{d.city}</div>
                                <div className="col-span-2">{d.phone}</div>
                                <div className="col-span-2">{d.email}</div>

                                <div className="col-span-1 text-right">
                                    <Link
                                        href={`/distributors/${d.id}`}
                                        className="text-indigo-400 hover:underline underline-offset-6"
                                    >
                                        Детайли →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
