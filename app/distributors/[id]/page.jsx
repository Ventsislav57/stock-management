"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/components/navigation/SideNav";

export default function DistributorDetails({ params }) {
    const router = useRouter();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`/api/distributors/${params.id}`)
            .then((res) => res.json())
            .then(setData);
    }, [params.id]);

    async function save() {
        await fetch(`/api/distributors/${params.id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        router.push("/distributors");
    }

    if (!data) return <div className="p-10 text-white">Зареждане...</div>;

    return (
        <section className="h-screen w-screen text-white flex flex-col md:flex-row overflow-y-auto">
            <SideNav />

            <div className="p-10 text-white w-full">
                <div className="flex justify-between items-center">

                    <h1 className="text-3xl font-bold mb-6">Детайли за дистрибутор</h1>

                    <button
                        onClick={save}
                        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                        Запази промените
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 p-6 rounded-xl border border-gray-700 mt-5">
                    {Object.keys(data).map((key) =>
                        key === "id" || key === "created_at" || key === "updated_at" ? null : (
                            <div key={key} className="flex flex-col">
                                <label className="text-gray-300 mb-1">{key}</label>
                                <input
                                    className="p-2 rounded bg-gray-700 border border-gray-600"
                                    value={data[key] ?? ""}
                                    onChange={(e) =>
                                        setData({ ...data, [key]: e.target.value })
                                    }
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
