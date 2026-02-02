"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";

import SideNav from "@/components/navigation/SideNav";
import { parseStringPromise } from "xml2js";
import { CloudUpload } from "lucide-react";

export default function StockInPage() {
    const [ reports, setReports ] = useState([]);
    const inputRef = useRef(null);
    const [ dragActive, setDragActive ] = useState(false);
    const [ totalPrice, setTotalPrice ] = useState(null);
    const [ currentTime, setCurrentTime ] = useState(new Date());
    const [ productDetails, setProductDetails ] = useState(null);
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000); // обновява се всяка секунда

        return () => clearInterval(interval); // почистване при unmount
    }, []);

    const handleFile = async (file) => {
        if (!file || file.type !== "text/xml") return;

        const text = await file.text();
        try {
            const result = await parseStringPromise(text, { explicitArray: false });
            
            const data = result?.NewDataSet?.Report || [];
            const parsed = Array.isArray(data) ? data : [data];

            const normalized = parsed.map((item) => (normalizeOperation(item)));
            let price = 0;

            normalized.map(item => {
                price += Number(item.price) * Number(item.quantity);
            })
            
            setTotalPrice(price.toFixed(2));
            setReports(normalized);
        } catch (err) {
            console.error("🔴 Error parsing XML:", err);
        }
    };

    function normalizeOperation(item) {
        console.log(item);
        
        return {
            operation_type:
                item.OperTypeInvisible === "1" 
                    ? "delivery"
                    : item.OperTypeInvisible === "2"
                    ? "sale"
                    : item.OperTypeInvisible === "3"
                    ? "writeoff"
                    : "unknown",
    
            code: item.Code ? Number(item.Code) : null,
            acct: item.Acct ? Number(item.Acct) : null,
            date: item.Date ? new Date(item.Date) : new Date(),
    
            product_id: item.ItemID ? Number(item.ItemID) : 0,
            product_name: item.GoodName || "",
            measure: item.Measure1 || null,
    
            partner_id: item.PartnerID ? Number(item.PartnerID) : null,
            partner_name: item.Partner || null,
            location_id: item.LocationID ? Number(item.LocationID) : null,
            location_name: item.Object || null,
    
            user_id: item.OperatorID ? Number(item.OperatorID) : null,
            user_name: item.UserName || null,
    
            quantity: parseFloat(item.Qtty) || 0,
            price: parseFloat(item.PriceIn) || 0,
            vat: parseFloat(item.VATIn) || 0,
            total: parseFloat(item.DeliverySum) || 0,
            partner: item.Partner,
    
            note: item.BG || null,
            raw_xml: JSON.stringify(item),
        };
    }
    

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            
        }
    };

    const handleUpload = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify({ reports }),
            });

            const data = await res.json();
            if (res.ok && data.status === 'success') {
                await Swal.fire({
                    icon: "success",
                    title: "Успешен запазване на данните!",
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
                setReports([]);
                setLoading(false);
            } else {
                await Swal.fire({
                    icon: "warning",
                    title: "Грешка при качване на данните!",
                    text: "Моля, сингнализирайте администратора.",
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
                setReports([]);
                setLoading(false);
            }
        } catch (err) {
            await Swal.fire({
                icon: "warning",
                title: "Грешка при качване на данните!",
                text: "Моля, сингнализирайте администратора.",
                timer: 2000,
                showConfirmButton: false,
                timerProgressBar: true,
            });
            setReports([]);
            setLoading(false);
        }
    };


    const cancelUpload = () => {
        setReports([]);
    }

    return (
      <main className="h-screen w-screen text-white flex flex-col md:flex-row">
            <SideNav />
            {loading && 
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80">
                    <span className="absolute top-1/3 text-xl">Зареждане...</span>
                    <span className="loader"></span>
                </div>
            }
            <div className="w-full flex flex-col items-center justify-center h-full">
            {productDetails ? (
                    <div className="relative w-[80%] h-[60vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg p-5 text-white">
                
                    </div>
                ) : reports.length === 0 ? (
                    <>
                        <div className={`cursor-pointer w-[300px] h-[300px] border-4 rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all duration-200 ${ dragActive ? "border-blue-400 bg-blue-900/30" : "border-dashed border-white/30 hover:border-white hover:bg-white/10" }`}
                            onClick={() => inputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <CloudUpload className="w-12 h-12 text-white/60 mb-4" />
                            <p className="text-white/80">
                            Пуснете тук XML файл
                            <br />
                            или кликнете, за да изберете
                            </p>
                            <input
                            type="file"
                            accept=".xml"
                            className="hidden"
                            ref={inputRef}
                            onChange={handleInputChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="p-20 ">
                    {/* Upload бутон */}
                    <div className="flex justify-between items-center mb-4 gap-5">
                        <div className="text-2xl">
                            <p>
                                Общо стойност: <b>{totalPrice} лв.</b>
                            </p>
                            <p>
                                Брой на продукти: <b>{reports.length} бр.</b>
                            </p>
                        </div>
                        <div className="flex items-center gap-5">
                            <button
                                onClick={handleUpload}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md cursor-pointer"
                            >
                                Запиши
                            </button>
                            <button
                                onClick={cancelUpload}
                                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md cursor-pointer"
                            >
                                Откажи
                            </button>
                        </div>
                    </div>
                    <div className="h-[70vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg">
                        {/* Header */}
                        <div className="sticky top-0 grid grid-cols-12 items-center text-white p-4 border-b-2 cursor-default bg-gray-900/90 font-semibold">
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
                                {/* Име на продукта */}
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.product_name}</span>
                                </div>
                            
                                {/* Количество */}
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.quantity}</span>
                                </div>
                            
                                {/* Цена */}
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.price?.toFixed(2)} лв.</span>
                                </div>
                            
                                {/* Обща сума */}
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.total?.toFixed(2)} лв.</span>
                                </div>
                            
                                {/* Дистрибутор (ако искаш име, трябва да го join-неш) */}
                                <div className="col-span-2 border-r-2 border-white text-center">
                                    <span>{report.partner}</span>
                                </div>
                            
                                {/* Дата */}
                                <div className="col-span-2 text-center">
                                    <span>{new Date(report.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </div>
      </main>
    );
}
