"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Login = () => {
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setError(false);
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setError(false);

    const res = await signIn("credentials", {
      redirect: false,
      username: loginData.username,
      password: loginData.password,
    });

    if (res?.ok) {
        await Swal.fire({
          icon: "success",
          title: "Успешен вход!",
          text: "Добре дошъл!",
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
        router.push('/');
    } else {
        await Swal.fire({
            icon: "error",
            title: "Грешка",
            text: "Грешно потребителско име или парола.",
            confirmButtonText: "Опитай пак",
        });
        setError(true);
    }
  };

  return (
    <section className="login relative">
        <div className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 md:w-[400px] h-[500px] rounded-xl bg-white/10 backdrop-blur-xs border-2 border-white/50">
            <form
                onSubmit={loginHandler}
                className="h-full flex flex-col justify-between py-10 px-5"
            >
                <div>
                        <h1 className="text-white text-2xl md:text-3xl tracking-wider text-center pt-6 relative z-10 border-b-2 border-white pb-3 w-2/3 mx-auto">
                            Добре дошъл!
                        </h1>
                        <div className="h-[20px] mt-2">
                            {error && (
                                <p className="text-red-700 text-center">
                                Грешно потребителско име или парола.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 mt-10">
                            <label className="text-gray-200" htmlFor="username">
                                Потребителско име
                            </label>
                            <input
                                className="bg-[#00000098] backdrop-blur-md border-2 border-white/30 rounded-full px-4 py-1 text-white text-xl mt-3"
                                name="username"
                                value={loginData.username}
                                onChange={changeHandler}
                            />
                        </div>

                        <div className="flex flex-col gap-1 mt-5 relative">
                            <label className="text-gray-200" htmlFor="password">
                                Парола
                            </label>
                            <input
                                className="bg-[#00000098] border-2 border-white/30 rounded-full px-4 py-1 text-white text-xl mt-3 pr-10"
                                name="password"
                                type={isPasswordVisible ? "text" : "password"}
                                value={loginData.password}
                                onChange={changeHandler}
                            />
                        </div>
                </div>

                <div className="flex justify-center">
                    <button className="button-86" role="button" type="submit">
                        Влизане
                    </button>
                </div>
            </form>
        </div>
    </section>
  );
};

export default Login;
