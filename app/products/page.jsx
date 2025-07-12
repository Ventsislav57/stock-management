'use client';
import SideNav from "@/components/navigation/SideNav";
import { useEffect, useState, useRef } from "react";


export default function Products() {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(10);
    const [skip, setSkip] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/products?limit=${limit}&skip=${skip}`); // промени по нужда
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Грешка при заявката");

                setReports(data.results);
                setTotal(data.total || 0);
            } catch (err) {

            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [limit, skip]);

    const handleNext = () => {
        if (skip + limit < total) setSkip(skip + limit);
    };

    const handlePrev = () => {
        if (skip - limit >= 0) setSkip(skip - limit);
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        setLimit(newLimit);
        setSkip(0); // рестартираме на стр. 1
    };

    return (
      <main className="h-screen w-scree text-white flex flex-col lg:flex-row">
        <SideNav />
        {loading && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80">
                <span className="absolute top-1/3 text-xl">Зареждане...</span>
                <span className="products-loader"></span>
            </div>
        )}
        <div className="w-full flex flex-col items-center justify-center h-full">
            {productDetails ? (
                <div className="relative w-[80%] h-[60vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg p-5 text-white">
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
                {productDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-3 justify-center gap-y-5 text-center">
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Номер на сметка:
                        </b>{" "}
                        {productDetails.Acct}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Дата:
                        </b>{" "}
                        {new Date(productDetails.Date).toLocaleString("bg-BG")}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Оператор (ID):
                        </b>{" "}
                        {productDetails.OperatorID}
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Продукт:
                        </b>{" "}
                        {productDetails.GoodName}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Количество:
                        </b>{" "}
                        {productDetails.Qtty}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Мярка:
                        </b>{" "}
                        {productDetails.Measure1}
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Ед. цена:
                        </b>{" "}
                        {Number(productDetails.PriceIN).toFixed(2)} лв.
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Обща стойност:
                        </b>{" "}
                        {Number(productDetails.deliverysum).toFixed(2)} лв.
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        ДДС:
                        </b>{" "}
                        {productDetails.VATIn}%
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Обект:
                        </b>{" "}
                        {productDetails.Object}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Група продукт:
                        </b>{" "}
                        {productDetails.GroupName}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        ID на продукт:
                        </b>{" "}
                        {productDetails.ItemID}
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Партньор:
                        </b>{" "}
                        {productDetails.Partner?.replace(/"/g, "")}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Група партньор:
                        </b>{" "}
                        {productDetails.PartnerGroupName}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        ID на партньор:
                        </b>{" "}
                        {productDetails.PartnerID}
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Име на оператор:
                        </b>{" "}
                        {productDetails.UserName}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Локация ID:
                        </b>{" "}
                        {productDetails.LocationID}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Обозначение (BG):
                        </b>{" "}
                        {productDetails.BG}
                    </div>

                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Тип операция (невидим):
                        </b>{" "}
                        {productDetails.OperTypeInvisible}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        Is Total:
                        </b>{" "}
                        {productDetails.IsTotal}
                    </div>
                    <div className="flex flex-col">
                        <b className="text-xl border-b-2 border-white pb-5 mb-5">
                        ItemGroupCode:
                        </b>{" "}
                        {productDetails.ItemGroupCode}
                    </div>
                    </div>
                )}
                </div>
            ) : reports.length === 0 ? (
                <>

                </>
            ) : (
                <div className="p-5 lg:p-20">
                    <div className="flex justify-between items-center mb-4 gap-5">
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
                    <div className="relative h-[60vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg">
                        {/* Header */}
                        <div className="grid grid-cols-12 items-center text-white p-4 border-b-6 cursor-default bg-white/10 font-semibold">
                            <div className="col-span-2 border-r-2 border-white text-center">
                                <span>Име на продукта</span>
                            </div>
                            <div className="col-span-2 border-r-2 border-white text-center">
                                <span>Количество</span>
                            </div>
                            <div className="col-span-2 border-r-2 border-white text-center">
                                <span>Ед. цена</span>
                            </div>
                            <div className="col-span-2 border-r-2 border-white text-center">
                                <span>Обща сума</span>
                            </div>
                            <div className="col-span-2 border-r-2 border-white text-center">
                                <span>Партньор</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span>Дата</span>
                            </div>
                        </div>

                        {/* Данни */}
                        {reports.map((report, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 items-center text-white py-4 border-b-2 bg-white/10 hover:bg-white/30 cursor-pointer"
                                onClick={() => setProductDetails(report)}
                            >
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.GoodName}</span>
                                </div>
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.Qtty}</span>
                                </div>
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{Number(report.PriceIN).toFixed(2)} лв.</span>
                                </div>
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{Number(report.deliverysum).toFixed(2)} лв.</span>
                                </div>
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.Partner}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                    <span>{new Date(report.Date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}

                        {/* Пагинация */}
                        <div className="sticky bottom-0 bg-white border-t-2 border-white mt-4 py-2 px-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-black">
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

                            <div className="flex items-center gap-2 text-black">
                                <label htmlFor="limit">Покажи по:</label>
                                <select
                                    id="limit"
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="border rounded px-2 py-1"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    );
}