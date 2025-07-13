import SideNav from "../navigation/SideNav";

const HomePage = () => {


    return (
        <section className="h-screen w-screen flex flex-col lg:flex-row">
            <SideNav />
            
            <div className="h-screen w-screen p-10 text-white">
                <h1 className="text-center text-3xl border-b-2 border-white pb-3">Табло</h1>

                <div className="grid grid-cols-3 gap-5 justify-center mt-5">
                    <div className="flex flex-col text-center">
                        <p>Статистика</p>
                    </div>
                    <div className="flex flex-col text-center">
                        <p>Статистика</p>
                    </div>
                    <div className="flex flex-col text-center">
                        <p>Статистика</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
