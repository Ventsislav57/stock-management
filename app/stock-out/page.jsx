"use client";

import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";

import SideNav from "@/components/navigation/SideNav";
import { parseStringPromise } from "xml2js";
import { CloudUpload } from "lucide-react";

export default function StockOutPage() {
    const [reports, setReports] = useState([]);
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [totalPrice, setTotalPrice] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [productDetails, setProductDetails] = useState(null);
    const [loading, setLoading] = useState(false);

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
        let profit = 0;

        result?.NewDataSet?.Report.map((item) => {
            profit += Number(item.Profit);
        });
        setTotalPrice(profit.toFixed(2));

        const data = result?.NewDataSet?.Report || [];
        const parsed = Array.isArray(data) ? data : [data];
        
        const normalized = parsed.map((item) => ({
            CodeSort: item.CodeSort || "",
            Acct: item.Acct || "",
            Date: item.Date || new Date().toISOString(),
            OperTypeInvisible: item.OperTypeInvisible || "",
            ItemID: item.ItemID || "",
            GoodName: item.GoodName || "",
            PartnerID: item.PartnerID || "",
            LocationID: item.LocationID || "",
            OperatorID: item.OperatorID || "",
            PriceOut: parseFloat(item.PriceOut) || 0,
            VATOut1: parseFloat(item.VATOut1) || 0,
            SaleSum: parseFloat(item.SaleSum) || 0,
            VATOut: parseFloat(item.VATOut) || 0,
            PriceIn: parseFloat(item.PriceIn) || 0,
            VATIn1: parseFloat(item.VATIn1) || 0,
            DeliverySum: parseFloat(item.DeliverySum) || 0,
            VATIn: parseFloat(item.VATIn) || 0,
            Profit: parseFloat(item.Profit) || 0,
            IsTotal: parseInt(item.IsTotal, 10) || 0,
        }));


        setReports(normalized);
        } catch (err) {

        }
    };

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
        const res = await fetch("/api/sell", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ reports }),
        });

        const data = await res.json();
        if (res.ok && data.status === "success") {
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
    };

    return (
      <main className="h-screen w-scree text-white flex">
        <SideNav />
        {loading && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80">
            <span className="absolute top-1/3 text-xl">Зареждане...</span>
            <span className="loader"></span>
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
                Детайли за продадения продукт
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
                <p className="text-3xl border-b-2 text-white pb-2">Качване на XML файл</p>
                <div
                    className={`mt-5 cursor-pointer w-[300px] h-[300px] border-4 rounded-xl flex flex-col items-center justify-center text-center p-4 transition-all duration-200
                    ${
                    dragActive
                        ? "border-blue-400 bg-blue-900/30"
                        : "border-dashed border-white/30 hover:border-white hover:bg-white/10"
                    }`}
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
                    Брой на прададени продукти: <b>{reports.length} бр.</b>
                  </p>
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
                <div className="flex items-center gap-5">
                  <button
                    onClick={handleUpload}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md cursor-pointer"
                  >
                    Качи данните
                  </button>
                  <button
                    onClick={cancelUpload}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md cursor-pointer"
                  >
                    Откажи
                  </button>
                </div>
              </div>
              <div className="h-[60vh] overflow-auto bg-gray-900/90 border-2 border-white rounded-lg">
                {/* Header */}
                <div className="sticky top-0 grid grid-cols-12 items-center text-white p-4 border-b-2 cursor-default bg-gray-900/90 font-semibold">
                    <div className="col-span-2 border-r-2 border-white text-center">
                        <span>Име на продукта</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                        <span>Доставна цена</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                        <span>Продажна цена</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                        <span>Печалба</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                        <span>Оператор</span>
                    </div>
                    <div className="col-span-2 text-center">
                        <span>Дата</span>
                    </div>
                </div>

                {/* Данни */}
                {reports.map((report, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center text-white p-4 border-b-2 bg-white/10 hover:bg-white/30 cursor-pointer"
                    onClick={() => setProductDetails(report)}
                  >
                    <div className="col-span-2 border-r-2 border-white text-center px-3">
                      <span>{report.GoodName}</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                      <span>{Number(report.PriceIn).toFixed(2)}</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                      <span>{Number(report.PriceOut).toFixed(2)} лв.</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                      <span>{Number(report.Profit).toFixed(2)} лв.</span>
                    </div>
                    <div className="col-span-2 border-r-2 border-white text-center">
                      <span>{report.OperatorID}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span>{new Date(report.Date).toLocaleDateString()}</span>
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
