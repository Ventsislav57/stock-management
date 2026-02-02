import SideNav from "../navigation/SideNav";

export default function HomePage() {
    return (
        <section className="h-screen w-screen flex flex-col lg:flex-row bg-gray-900 text-white">
            <SideNav />

            <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-10">

                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">Админ Панел</h1>
                        <p className="text-gray-400 mt-1">
                            Управлявай доставки, продажби, изписвания и поръчки от едно място.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex gap-3">
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold cursor-pointer">
                            + Нова Поръчка
                        </button>
                    </div>
                </header>

                {/* KPI CARDS */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                        { title: "Доставки", value: "124", trend: "+12%" },
                        { title: "Продажби", value: "312", trend: "+8%" },
                        { title: "Изписвания", value: "58", trend: "-3%" },
                        { title: "Активни поръчки", value: "17", trend: "+2%" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition"
                        >
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className="text-4xl font-bold mt-2">{item.value}</p>
                            <p
                                className={`text-sm mt-1 ${
                                    item.trend.startsWith("+")
                                        ? "text-green-400"
                                        : "text-red-400"
                                }`}
                            >
                                {item.trend} този месец
                            </p>
                        </div>
                    ))}
                </section>

                {/* GRID: GRAPH + ACTIVITY + QUICK ACTIONS */}

                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Последни активности</h2>

                        <div className="space-y-4">
                            {[
                                { text: "Нова доставка – Обект Стара Загора", time: "преди 12 мин" },
                                { text: "Продажба – Артикул #4421", time: "преди 30 мин" },
                                { text: "Изписване – Обект Казанлък", time: "преди 1 час" },
                                { text: "Поръчка #112 одобрена", time: "преди 2 часа" },
                            ].map((log, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                >
                                    <span>{log.text}</span>
                                    <span className="text-sm text-gray-300">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>


            </div>
        </section>
    );
}
