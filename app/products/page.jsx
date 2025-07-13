'use client';
import SideNav from "@/components/navigation/SideNav";
import { useEffect, useState, useRef } from "react";



export default function Products() {
    const [reports, setReports] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(50);
    const [skip, setSkip] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({
        itemId: "",
        productNumber: "",
        goodName: "",
        priceIn: "",
        qttyMin: "", // за слайдера
        Partner: "",
        date: "", // за филтър по дата
    });
    const qttyMin = Number(searchParams.qttyMin) || 0;
    const qttyMax = Number(searchParams.qttyMax) || 100;
    const rangeWidth = qttyMax - qttyMin;

      const initialMin = Number(searchParams.qttyMin) || 0;
      const initialMax = Number(searchParams.qttyMax) || 100;

      const [min, setMin] = useState(initialMin);
      const [max, setMax] = useState(initialMax);

      // Увери се, че min не е по-голям от max
      useEffect(() => {
        if (min > max) setMin(max)
        if (max < min) setMax(min)
    }, [min, max])

    const [ searchField, setSearchField ] = useState("product-name");
    const debounceTimeout = useRef(null);

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(skip / limit) + 1;

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(() => {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const query = new URLSearchParams({
                        limit,
                        skip,
                        itemId: searchParams.itemId,
                        ItemID: searchParams.productNumber,
                        goodName: searchParams.goodName,
                        priceIn: searchParams.priceIn,
                        qttyMin: searchParams.qttyMin,
                        qttyMax: searchParams.qttyMax,
                        Date: searchParams.date ? new Date(searchParams.date).toISOString().split("T")[0] : "",
                        partner: searchParams.Partner, // ✅ добави това
                    }).toString();


                    const res = await fetch(`/api/products?${query}`);

                    const data = await res.json();

                    if (!res.ok) throw new Error(data.error || "Грешка при заявката");

                    setReports(data.results);
                    setTotal(data.total || 0);
                } catch (err) {
                    console.error("Грешка при търсене", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }, 1000);

        return () => clearTimeout(debounceTimeout.current);
    }, [searchParams, skip, limit]);

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
            ) : (
                <div className="p-5 lg:p-20">
                    <div className="flex justify-between items-center mb-4 gap-5">
                        <div className="w-1/2 grid grid-cols-3 gap-5">
                            <button className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl"  onClick={() => setSearchField('product-name')}>
                                <span>Търсене на продукт</span>
                            </button>
                            <button className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl" onClick={() => setSearchField('search-by')}>
                                <span>Търсене по ...</span>
                            </button>
                            <button className="border-2 border-white py-2 w-full rounded-xl cursor-pointer bg-gray-900/90 hover:bg-black/90 hoder:font-bold text-xl" onClick={() => setSearchField('search-by')}>
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
                        {/* Header */}
                        <div className="sticky top-0 bg-gray-900 text-white p-4 border-b-2 cursor-default font-semibold">
                            {searchField === 'product-name' && 
                                <div className="col-span-12 flex justify-between gap-y-6 gap-x-4 border-b-2 border-white pb-4 mb-5">
                                    <div className="grid grid-cols-6 gap-5">
                                        <input
                                            type="text"
                                            name="productNumber"
                                            placeholder="Номер на продукта"
                                            value={searchParams.productNumber}
                                            onChange={handleSearchChange}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            name="goodName"
                                            placeholder="Име на продукта"
                                            value={searchParams.goodName}
                                            onChange={handleSearchChange}
                                            className="border p-2 rounded"
                                        />
                                        <input
                                            type="text"
                                            name="Qtty"
                                            placeholder="Item ID"
                                            value={searchParams.Qtty}
                                            onChange={handleSearchChange}
                                            className="border p-2 rounded cursor-not-allowed"
                                        />
                                        <div className="w-full px-4 h-full cursor-not-allowed">
                                            <div className="relative h-1 bg-slate-200 rounded-full">
                                                {/* активен диапазон */}
                                                <div
                                                    className="absolute h-full bg-slate-800 rounded-full"
                                                    style={{
                                                        left: `${min}%`,
                                                        width: `${max - min}%`,
                                                    }}
                                                    ></div>

                                                    {/* Input: мин. стойност */}
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={min}
                                                        onChange={(e) => setMin(Number(e.target.value))}
                                                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-1"
                                                        style={{ zIndex: 20 }}
                                                    />

                                                    {/* Input: макс. стойност */}
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={max}
                                                        onChange={(e) => setMax(Number(e.target.value))}
                                                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-1"
                                                        style={{ zIndex: 10 }}
                                                    />

                                                    {/* Кръгчета */}
                                                    <div
                                                    className="absolute w-3.5 h-3.5 rounded-full bg-slate-800 border border-white shadow"
                                                    style={{
                                                        left: `${min}%`,
                                                        top: '-6px',
                                                        transform: 'translate(-50%, 0)',
                                                        zIndex: 30,
                                                    }}
                                                    ></div>

                                                    <div
                                                        className="absolute w-3.5 h-3.5 rounded-full bg-slate-800 border border-white shadow"
                                                        style={{
                                                            left: `${max}%`,
                                                            top: '-6px',
                                                            transform: 'translate(-50%, 0)',
                                                            zIndex: 30,
                                                        }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-sm mt-2 text-gray-600">
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
                                                    className="border p-2 rounded"
                                                />

                                                {/* Дата */}
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={searchParams.date}
                                                    onChange={handleSearchChange}
                                                    className="border p-2 rounded"
                                                />
                                            </div>
                                        </div>
                            }

                            {searchField === 'search-by' && 
                                <div className="col-span-12 flex justify-between gap-y-6 gap-x-4 border-b-2 border-white pb-4 mb-5 h-[60px]">
                                    <p>Филтри за</p>
                                </div>
                            }
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
                                    <span>Дата на последно зареждане</span>
                                </div>
                            </div>
                        </div>
                        {/* Данни */}
                        <div className="h-full">
                            {reports.map((report, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 items-center text-white py-4 border-b-2 bg-white/10 hover:bg-white/30 cursor-pointer"
                                    onClick={() => setProductDetails(report)}
                                >
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>{report.ItemID}</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center px-2">
                                        <span>{report.GoodName}</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>{report.Qtty}</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>{Number(report.PriceIN).toFixed(2)} лв.</span>
                                    </div>
                                    <div className="col-span-2 border-r-2 border-white text-center">
                                        <span>{report.Partner}</span>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span>{new Date(report.Date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                    {/* Пагинация */}
                    <div className="sticky bottom-0 bg-gray-900 py-4 px-4 flex items-center justify-between rounded-b-xl">
                        <div className="">
                            <p>Общ брой продукти: <b>{ total } бр.</b></p>
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
                                className="border rounded px-2 py-1"
                            >
                                <option className="text-black" value="5">5</option>
                                <option className="text-black" value="10">10</option>
                                <option className="text-black" value="25">25</option>
                                <option className="text-black" value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    );
}