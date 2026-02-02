"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SideNav from "@/components/navigation/SideNav";

export default function DistributorsPage() {
    const [list, setList] = useState([]);

    useEffect(() => {
        fetch("/api/distributors")
            .then((res) => res.json())
            .then(setList);
    }, []);

    return (
        <section className="h-screen w-screen text-white flex flex-col md:flex-row">
            <SideNav />
            <div className="p-10 text-white w-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Дистрибутори</h1>

                    <Link
                        href="/distributors/new"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                        + Нов дистрибутор
                    </Link>
                </div>

                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-600 text-gray-300">
                                <th className="py-3">Име</th>
                                <th>Град</th>
                                <th>Телефон</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {list.map((d) => (
                                <tr key={d.id} className="border-b border-gray-700">
                                    <td className="py-3">{d.name}</td>
                                    <td>{d.city}</td>
                                    <td>{d.phone}</td>
                                    <td>{d.email}</td>
                                    <td className="text-right">
                                        <Link
                                            href={`/distributors/${d.id}`}
                                            className="text-indigo-400 hover:underline"
                                        >
                                            Детайли →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
