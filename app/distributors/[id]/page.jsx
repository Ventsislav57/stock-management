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
    }, [params?.id]);

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

            <div className="p-10 w-full space-y-10 h-screen overflow-auto">


                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl space-y-3">
                    <div className="flex justify-between items-center border-b-2 pb-2">
                        <div>
                            <h1 className="text-4xl font-bold">Детайли за дистрибутор</h1>
                            <p className="mt-2 text-gray-300">
                                Редактирай информацията за партньора. Промените ще се отразят в доставките и справките.
                            </p>
                        </div>

                        <button
                            onClick={save}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold shadow-lg transition cursor-pointer"
                        >
                            Запази промените
                        </button>
                    </div>

                    <div className="h-[calc(100vh-300px)] overflow-y-auto">
                        {/* Основна информация */}
                        <div className="border-b-2 pb-10">
                            <h2 className="text-xl font-semibold mb-4">Основна информация</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field
                                    label="Име на фирмата"
                                    description="Официалното име на дистрибутора."
                                    value={data.name}
                                    onChange={(v) => setData({ ...data, name: v })}
                                />

                                <Field
                                    label="Булстат / ЕИК"
                                    description="Уникален идентификационен номер на фирмата."
                                    value={data.bulstat}
                                    onChange={(v) => setData({ ...data, bulstat: v })}
                                />

                                <Field
                                    label="Град"
                                    description="Град, в който се намира фирмата."
                                    value={data.city}
                                    onChange={(v) => setData({ ...data, city: v })}
                                />

                                <Field
                                    label="Адрес"
                                    description="Пълен адрес на фирмата."
                                    value={data.address}
                                    onChange={(v) => setData({ ...data, address: v })}
                                />
                            </div>
                        </div>

                        {/* Контактна информация */}
                        <div className="border-b-2 pb-10">
                            <h2 className="text-xl font-semibold mb-4">Контактна информация</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field
                                    label="Лице за контакт"
                                    description="Име на човек, с когото комуникирате."
                                    value={data.contact_person}
                                    onChange={(v) => setData({ ...data, contact_person: v })}
                                />

                                <Field
                                    label="Телефон"
                                    description="Телефон за връзка."
                                    value={data.phone}
                                    onChange={(v) => setData({ ...data, phone: v })}
                                />

                                <Field
                                    label="Email"
                                    description="Имейл адрес за комуникация."
                                    value={data.email}
                                    onChange={(v) => setData({ ...data, email: v })}
                                />
                            </div>
                        </div>

                        {/* Локация */}
                        <div className="w-1/2 pr-3 mt-4">
                            <h2 className="text-xl font-semibold mb-4">Локация</h2>

                            <Field
                                label="Държава"
                                description="По подразбиране: България."
                                value={data.country}
                                onChange={(v) => setData({ ...data, country: v })}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function Field({ label, description, value, onChange }) {
    return (
        <div className="flex flex-col">
            <label className="font-medium text-gray-200">{label}</label>
            <p className="text-sm text-gray-400 mb-2">{description}</p>
            <input
                className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
