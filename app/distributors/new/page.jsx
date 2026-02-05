"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import SideNav from "@/components/navigation/SideNav";


export default function NewDistributorPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "ДЕКА-ТРЕЙД ООД",
        vat_number: "",
        bulstat: "126047182",
        contact_person: "ivan",
        phone: "0899090900",
        email: "ivan@abv.bg",
        address: "р-н Северен, бул. ВАСИЛ АПРИЛОВ, 170",
        city: "Пловдив",
        country: "Bulgaria",
    });

    function update(key, value) {
        setForm({ ...form, [key]: value });
    }

    async function submit() {
        try {
            const { status } = await fetch("/api/distributors", {
                method: "POST",
                body: JSON.stringify(form),
            });
            
            if (status === 'success') {
                await Swal.fire({
                    icon: "success",
                    title: "Успешно създаване!",
                    text: `<b>${form.name}</b> е успешно добавен.`,
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
                router.push("/distributors");
                return;
            } else {
                await Swal.fire({
                    icon: "error",
                    title: "Неуспешно създаване",
                    text: "Моля, проверете дали въведените данни са коректни. Ако всичко изглежда наред, но грешката продължава да се появява, свържете се с администратора на магазина.",
                    confirmButtonText: "Затвори",
                });
                
            }

        } catch (error) {
            // TODO Implemnt logger for errors!!
            await Swal.fire({
                icon: "error",
                title: "Неуспешно създаване",
                text: "Моля, проверете дали въведените данни са коректни. Ако всичко изглежда наред, но грешката продължава да се появява, свържете се с администратора на магазина.",
                confirmButtonText: "Затвори",
            });
        }
    }

    return (
        <section className="h-screen w-screen text-white flex flex-col md:flex-row overflow-y-auto">
            <SideNav />

            <div className="p-10 w-full space-y-10 h-screen overflow-auto">

                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl space-y-3">
                    <div className="flex justify-between items-center border-b-2 pb-2">
                        <div>
                            <h1 className="text-4xl font-bold">Нов дистрибутор</h1>
                            <p className="mt-2">
                                Въведи информация за нов партньор, който ще бъде използван при доставки, продажби и справки.
                            </p>
                        </div>
                        <button
                            onClick={submit}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold shadow-lg transition cursor-pointer"
                        >
                            Запази дистрибутора
                        </button>
                    </div>

                    <div className="border-b-2 pb-10">
                        <h2 className="text-xl font-semibold mb-4">Основна информация</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field
                                label="Име на фирмата"
                                description="Официалното име на дистрибутора."
                                value={form.name}
                                onChange={(v) => update("name", v)}
                            />

                            <Field
                                label="Булстат / ЕИК"
                                description="Уникален идентификационен номер на фирмата."
                                value={form.bulstat}
                                onChange={(v) => update("bulstat", v)}
                            />

                            {/* <Field
                                label="ДДС номер"
                                description="Ако фирмата е регистрирана по ДДС."
                                value={form.vat_number}
                                onChange={(v) => update("vat_number", v)}
                            /> */}

                            <Field
                                label="Град"
                                description="Град, в който се намира фирмата."
                                value={form.city}
                                onChange={(v) => update("city", v)}
                            />

                            <Field
                                label="Адрес"
                                description="Пълен адрес на фирмата."
                                value={form.address}
                                onChange={(v) => update("address", v)}
                            />

                        </div>
                    </div>

                    <div className="border-b-2 pb-10">
                        <h2 className="text-xl font-semibold mb-4">Контактна информация</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field
                                label="Лице за контакт"
                                description="Име на човек, с когото комуникирате."
                                value={form.contact_person}
                                onChange={(v) => update("contact_person", v)}
                            />

                            <Field
                                label="Телефон"
                                description="Телефон за връзка."
                                value={form.phone}
                                onChange={(v) => update("phone", v)}
                            />

                            <Field
                                label="Email"
                                description="Имейл адрес за комуникация."
                                value={form.email}
                                onChange={(v) => update("email", v)}
                            />

                        </div>
                    </div>

                    <div className="w-1/2 pr-3">
                        <h2 className="text-xl font-semibold mb-4">Локация</h2>

                        <Field
                            label="Държава"
                            description="По подразбиране: България."
                            value={form.country}
                            onChange={(v) => update("country", v)}
                        />
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
