
import { useState, useEffect, useRef } from "react";
import SideNav from "../navigation/SideNav";

const HomePage = () => {
    const [ bgnValue, setBgnValue ] = useState("");
    const [ listening, setListening ] = useState(false);
    const [ isChrome, setIsChrome ] = useState(false);
    const recognitionRef = useRef(null);
    const exchangeRate = 1.95583;

    useEffect(() => {
        if (typeof window === "undefined") return;

        const userAgent = navigator.userAgent.toLowerCase();
        const isChrome = /chrome/.test(userAgent) && !/edge|edg|opr|opera|brave/.test(userAgent);
        const isBrave = (navigator.brave && typeof navigator.brave.isBrave === "function" && navigator.brave.isBrave()) || userAgent.includes("brave");
        setIsChrome(isChrome && !isBrave);

        if (!isChrome) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        
        recognition.lang = "bg-BG";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const numberFromVoice = transcript.replace(/[^0-9.]/g, "").trim();
            if (numberFromVoice) setBgnValue(numberFromVoice);
            setListening(false);
        };

        recognition.onerror = (event) => {
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;
    }, []);



    const startListening = () => {
        if (recognitionRef.current) {
            setListening(true);
            recognitionRef.current.start();
        }
    };

    const calculateEuro = () => {
        const num = parseFloat(bgnValue);
        if (isNaN(num)) return "0.00";
        return (num / exchangeRate).toFixed(2);
    };

    return (
        <section className="h-screen w-screen flex flex-col lg:flex-row">
            <SideNav />

            <div className="flex-1 p-6 lg:p-10 text-white overflow-y-auto">
                <h1 className="text-center text-2xl md:text-4xl font-bold border-b border-white pb-4">
                    Калкулатор BGN → EUR
                </h1>

                <div className="max-w-md mx-auto mt-10 border border-white/20 bg-white/10 p-8 rounded-2xl shadow-xl backdrop-blur-md">
                    <div className="flex flex-col gap-6">
                        <label className="text-lg font-medium text-center">
                            Въведи сума в лева (BGN):
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Въведи лева"
                            value={bgnValue}
                            onChange={(e) => setBgnValue(e.target.value)}
                            className="w-full px-6 py-3 rounded-full bg-white text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                         {isChrome && 
                            <button
                                onClick={startListening}
                                disabled={listening}
                                className={`mt-2 w-full py-3 rounded-full text-lg font-medium cursor-pointer ${
                                    listening
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                                }`}
                            >
                                {listening ? "Слуша..." : "🎤 Говори"}
                            </button>
                        }

                        <div className="text-center mt-4">
                            <p className="text-white text-xl font-medium">
                                1 EUR = <span className="font-bold">{exchangeRate}</span> BGN
                            </p>
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-lg">Резултат в евро:</p>
                            <p className="text-4xl font-bold text-yellow-400 mt-2">
                                € {calculateEuro()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
