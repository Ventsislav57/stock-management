'use client'
import Link from "next/link";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const SideNav = () => {

    const [ isMenuOpen, setIsMenuOpen ] = useState(false); 

    

    return (
        <div className="h-[100px] lg:h-screen bg-white/10 w-full lg:w-[20%] px-5 lg:px-0 flex lg:flex-col items-center justify-between border-b-2 lg:border-r-2 border-gray-400">
            <div className="flex flex-col items-center justify-center py-5 lg:pt-5">
                <Link href="/">
                    <img 
                        alt="logo" 
                        loading="lazy" 
                        width="270" 
                        height="100" 
                        decoding="async" 
                        data-nimg="1" 
                        className="hidden lg:block" 
                        src="https://stromet.s3.eu-north-1.amazonaws.com/house_logo.png"
                    ></img>
                    <img
                        alt="logo"
                        loading="lazy"
                        width="250"
                        height="42"
                        decoding="async"
                        data-nimg="1"
                        className="second_logoxl:absolute ml-2 xl:mt-3" 
                        src="https://stromet.s3.eu-north-1.amazonaws.com/logo.png"
                    ></img>
                </Link>
            </div>

            <div className="lg:hidden bg-white/20 rounded-full w-[40px] h-[40px] flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M120-680v-80h720v80H120Zm0 480v-80h720v80H120Zm0-240v-80h720v80H120Z"/></svg>
            </div>

            {isMenuOpen &&
                <div className="fixed inset-0 w-2/3 ml-auto bg-white/90 flex lg:hidden flex-col justify-between py-5 items-center border-l-2 border-gray-500">
                    <span className="absolute top-2 right-5 text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>X</span>
                    <ul className="w-full flex flex-col gap-5 justify-start mt-20 px-5">
                        <Link className="text-xl" href="/products">📦 Продукти</Link>
                        <Link className="text-xl" href="/stock-out">💸 За Продажби</Link>
                        <Link className="text-xl" href="/stock-in">📥 За Доставки </Link>
                    </ul>

                    <button
                        className="button-86"
                        role="button"
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        Изход
                    </button>
                </div>
            }

            <div className="hidden lg:block w-full px-5 text-white">
                <ul className="w-full flex flex-col gap-5 justify-start">
                    <Link className="text-md 2xl:text-xl" href="/products">📦 Продукти</Link>
                    <Link className="text-md 2xl:text-xl" href="/stock-out">💸 За Продажби</Link>
                    <Link className="text-md 2xl:text-xl" href="/stock-in">📥 За Доставки </Link>
                </ul>
            </div>


            <div className="hidden lg:flex items-center justify-center mb-10">
                <button
                    className="button-86"
                    role="button"
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    Изход
                </button>
            </div>
        </div>
    )
}


export default SideNav;