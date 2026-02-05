"use client";
import SideNav from "@/components/navigation/SideNav";
import { useEffect, useState, useRef } from "react";

import DistributorSelect from "@/components/distributors/DistributorSelect";

function rowBgByColor(color) {
    if (color === "red") return "bg-red-500/25 hover:bg-red-500/35";
    if (color === "yellow") return "bg-yellow-500/20 hover:bg-yellow-500/30";
    return "bg-white/10 hover:bg-white/30";
}

export default function Products() {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ NEW: distributor filter (from dropdown)
    const [distributorId, setDistributorId] = useState("");

    const [searchParams, setSearchParams] = useState({
        productNumber: "",
        goodName: "",
        itemId: "", // ✅ FIX: имаш input за itemId, но нямаше state
        priceIn: "",
        qttyMin: "",
        qttyMax: "",
        Partner: "",
        date: "",
    });

    const [min, setMin] = useState(Number(searchParams.qttyMin) || 0);
    const [max, setMax] = useState(Number(searchParams.qttyMax) || 100);

    useEffect(() => {
        setCurrentTime(new Date());
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        if (min > max) setMin(max);
        if (max < min) setMax(min);
    }, [min, max]);

    useEffect(() => {
        setSearchParams((prev) => ({
            ...prev,
            qttyMin: String(min),
            qttyMax: String(max),
        }));
    }, [min, max]);

    const [searchField, setSearchField] = useState("product-name");
    const debounceTimeout = useRef(null);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.floor(skip / limit) + 1;

    // ✅ Fetch data (includes distributorId)
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const qs = new URLSearchParams({
                        limit: String(limit),
                        skip: String(skip),

                        // legacy / current filters
                        ItemID: searchParams.productNumber, // по твоя API
                        goodName: searchParams.goodName,
                        priceIn: searchParams.priceIn,
                        qttyMin: searchParams.qttyMin,
                        qttyMax: searchParams.qttyMax,
                        Date: searchParams.date
                            ? new Date(searchParams.date).toISOString().split("T")[0]
                            : "",
                        partner: searchParams.Partner,
                    });

                    // ✅ NEW: distributorId param
                    if (distributorId) qs.set("distributorId", distributorId);

                    // ✅ Ако искаш да ползваш itemId филтъра реално:
                    // (в момента API-то ти гледа itemId/ItemID, но ти вече пращаш ItemID от productNumber)
                    // Ако искаш отделно itemId поле, ще трябва да решиш кой от двата да отива в ItemID.
                    // Засега НЕ го пращам, за да не се бият.
                    // if (searchParams.itemId) qs.set("itemId", searchParams.itemId);

                    const res = await fetch(`/api/products?${qs.toString()}`, { cache: "no-store" });
                    const data = await res.json();

                    if (!res.ok) throw new Error(data.error || "Грешка при заявката");

                    setReports(data.results || []);
                    setTotal(data.total || 0);

                    // по желание: ако API върне selectedDistributorId, може да го синхронизираш
                    // if (!distributorId && data.selectedDistributorId) setDistributorId(data.selectedDistributorId);
                } catch (err) {
                    console.error("Грешка при търсене", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }, 500);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchParams, skip, limit, distributorId]); // ✅ добавих distributorId

    const handleNext = () => {
        if (skip + limit < total) setSkip(skip + limit);
    };

    const handlePrev = () => {
        if (skip - limit >= 0) setSkip(skip - limit);
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
        setSkip(0);
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setLimit(newLimit);
        setSkip(0);
    };

    // ✅ NEW: handle distributor change
    const handleDistributorChange = (id) => {
        setDistributorId(id);
        setSkip(0);
        setProductDetails(null);
    };

    return (
        <main className="h-screen w-scree text-white flex flex-col lg:flex-row">
            <SideNav />

            {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
                    <span className="absolute top-1/3 text-xl">Зареждане...</span>
                    <span className="products-loader"></span>
                </div>
            )}

            <div className="w-full flex flex-col items-center justify-center h-full mt-20 md:mt-0">
                {productDetails ? (
                    <div className="relative w-[80%] h-[90vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg p-5 text-white">
                        <div
                            className="absolute left-5 top-6 cursor-pointer transition-all duration-300 hover:ml-[-5px]"
                            onClick={() => setProductDetails(null)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="#FFFFFF"
                            >
                                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 border-b-2 border-white text-center pb-4">
                            Детайли за продукта
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-y-5 text-center">
                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Номер на продукта:</b>
                                {productDetails.product_id}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Име на продукта:</b>
                                {productDetails.product_name}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Item ID:</b>
                                {productDetails.item_id ?? "-"}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Наличност:</b>
                                {Number(productDetails.stock ?? 0)}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Доставна цена:</b>
                                {productDetails.delivery_price != null
                                    ? `${Number(productDetails.delivery_price).toFixed(2)} лв.`
                                    : "-"}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Партньор:</b>
                                {productDetails.distributor_name ?? "-"}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Дата на последно зареждане:</b>
                                {productDetails.last_restocked_at
                                    ? new Date(productDetails.last_restocked_at).toLocaleString("bg-BG")
                                    : "-"}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Последна доставка (бр.):</b>
                                {productDetails.last_delivery_qty ?? "-"}
                            </div>

                            <div className="flex flex-col">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Процент наличност:</b>
                                {productDetails.stock_percent != null ? `${productDetails.stock_percent}%` : "-"}
                            </div>

                            <div className="flex flex-col md:col-span-3">
                                <b className="text-xl border-b-2 border-white pb-5 mb-5">Статус:</b>
                                <span
                                    className={
                                        productDetails.color === "red"
                                            ? "text-red-300"
                                            : productDetails.color === "yellow"
                                                ? "text-yellow-300"
                                                : "text-green-300"
                                    }
                                >
                  {productDetails.color?.toUpperCase()}
                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 lg:p-20 w-full">
                        <div className="flex flex-col xl:flex-row justify-between items-center mb-4 mt-48 md:mt-0 gap-5">
                            <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-3 gap-5">
                                <button
                                    className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl"
                                    onClick={() => setSearchField("product-name")}
                                >
                                    <span>Търсене на продукт</span>
                                </button>
                                <button
                                    className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl"
                                    onClick={() => setSearchField("search-by")}
                                >
                                    <span>Търсене по ...</span>
                                </button>
                                <button
                                    className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl"
                                    onClick={() => setSearchField("search-by")}
                                >
                                    <span>Търсене по ...</span>
                                </button>
                            </div>

                            <div className="text-2xl">
                                <p>
                                    Дата:{" "}
                                    <b>
                                        {currentTime.toLocaleString("bg-BG", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}{" "}
                                        часа
                                    </b>
                                </p>
                            </div>
                        </div>

                        <div className="relative h-[80vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-t-lg">
                            <div className="sticky top-0 bg-gray-900 text-white p-4 border-b-2 cursor-default font-semibold">
                                {/* ✅ NEW: Distributor dropdown */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                    <DistributorSelect
                                        value={distributorId}
                                        onChange={handleDistributorChange}
                                    />

                                    {/* debug (можеш да го махнеш после) */}
                                    <div className="text-xs text-white/60">
                                        distributorId: <span className="text-white">{distributorId || "(default)"}</span>
                                    </div>
                                </div>

                                {searchField === "product-name" && (
                                    <div className="col-span-12 flex justify-between gap-y-6 gap-x-4 border-b-2 border-white pb-4 mb-5">
                                        <div className="grid grid-cols-6 gap-5 w-full">
                                            <input
                                                type="text"
                                                name="productNumber"
                                                placeholder="Номер на продукта"
                                                value={searchParams.productNumber}
                                                onChange={handleSearchChange}
                                                className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                            />

                                            <input
                                                type="text"
                                                name="goodName"
                                                placeholder="Име на продукта"
                                                value={searchParams.goodName}
                                                onChange={handleSearchChange}
                                                className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                            />

                                            <input
                                                type="text"
                                                name="itemId"
                                                placeholder="Item ID"
                                                value={searchParams.itemId}
                                                onChange={handleSearchChange}
                                                className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                            />

                                            {/* Slider (min/max stock) */}
                                            <div className="w-full px-4 h-full">
                                                <div className="relative h-1 bg-slate-200 rounded-full">
                                                    <div
                                                        className="absolute h-full bg-slate-800 rounded-full"
                                                        style={{
                                                            left: `${min}%`,
                                                            width: `${max - min}%`,
                                                        }}
                                                    ></div>

                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={min}
                                                        onChange={(e) => setMin(Number(e.target.value))}
                                                        className="absolute w-full appearance-none bg-transparent h-1"
                                                        style={{ zIndex: 20 }}
                                                    />

                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={max}
                                                        onChange={(e) => setMax(Number(e.target.value))}
                                                        className="absolute w-full appearance-none bg-transparent h-1"
                                                        style={{ zIndex: 10 }}
                                                    />
                                                </div>

                                                <div className="flex justify-between text-sm mt-2 text-gray-300">
                                                    <span>Мин: {min}</span>
                                                    <span>Макс: {max}</span>
                                                </div>
                                            </div>

                                            <input
                                                type="text"
                                                name="Partner"
                                                placeholder="Партньор"
                                                value={searchParams.Partner}
                                                onChange={handleSearchChange}
                                                className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                            />

                                            <input
                                                type="date"
                                                name="date"
                                                value={searchParams.date}
                                                onChange={handleSearchChange}
                                                className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-12 items-center">
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>Номер на продукта</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>Име на продукта</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>Наличност</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>Доставна цена</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>Партньор</span>
                                    </div>
                                    <div className="col-span-2 text-center px-4">
                                        <span>Последно зареждане</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-full">
                                {reports.map((p, index) => (
                                    <div
                                        key={p.id ?? index}
                                        className={`grid grid-cols-12 items-center text-white py-4 border-b-2 cursor-pointer ${rowBgByColor(
                                            p.color
                                        )}`}
                                        onClick={() => setProductDetails(p)}
                                        title={
                                            p.stock_percent != null
                                                ? `Наличност: ${p.stock_percent}% (посл. доставка: ${p.last_delivery_qty ?? "-"})`
                                                : "Няма данни за последна доставка"
                                        }
                                    >
                                        <div className="col-span-2 border-r-2 border-white text-center">
                                            <span>{p.product_id}</span>
                                        </div>
                                        <div className="col-span-2 border-r-2 border-white text-center px-2">
                                            <span>{p.product_name}</span>
                                        </div>
                                        <div className="col-span-2 border-r-2 border-white text-center">
                      <span>
                        {Number(p.stock ?? 0)}
                          {p.stock_percent != null ? ` (${p.stock_percent}%)` : ""}
                      </span>
                                        </div>
                                        <div className="col-span-2 border-r-2 border-white text-center">
                                            <span>{p.delivery_price != null ? `${Number(p.delivery_price).toFixed(2)} лв.` : "-"}</span>
                                        </div>
                                        <div className="col-span-2 border-r-2 border-white text-center">
                                            <span>{p.distributor_name ?? "-"}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span>{p.last_restocked_at ? new Date(p.last_restocked_at).toLocaleDateString("bg-BG") : "-"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-900 py-4 px-4 flex items-center justify-between rounded-b-xl">
                            <div>
                                <p>
                                    Общ брой продукти: <b>{total} бр.</b>
                                </p>
                            </div>

                            <div className="grid grid-cols-3 justify-center items-center gap-2 text-white">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Назад
                                </button>
                                <span>
                  Страница {currentPage} от {totalPages}
                </span>
                                <button
                                    onClick={handleNext}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
                                >
                                    Напред
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <label htmlFor="limit">Брой продукти на страница:</label>
                                <select
                                    id="limit"
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="border p-2 rounded bg-transparent text-white placeholder:text-white/60"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
