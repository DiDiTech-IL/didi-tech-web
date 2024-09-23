import DidiTechImage from "../assets/didi_tech_logo_white.png"
function Hero() {
    return (
        <div className="border-b border-neutral-900 pb-4 lg:mb-35">
            <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2">
                    <div className="flex flex-col items-center lg:items-start">
                        <h1 className="pb-16 font-heebo text-4xl font-bold tracking-tight lg:mt-16 lg:text-6xl">
                            ברוכים הבאים לדידי-טק                        </h1>
                        <span className="font-assistant bg-gradient-to-l from-green-300 via-slate-500 to-blue-700 bg-clip-text text-4xl tracking-tight text-transparent">
                            כאן משקיעים בפיתוח מוצרים ופיתוח אנשים
                        </span>
                        <p className="my-2 max-w-xl py-6 font-light tracking-tighter font-rubik">
                            עם מספר לא מבוטל של שנים בעולם התוכנה אני מביא לכאן בשורה בנוגע לכל מה שקשור לפיתוח וללמידת תכנות בקרב צעירים או סתם אנשים שמעוניינים להרחיב את היכולות והידיעות שלהם
                        </p>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 lg:p-8">
                    <div className="flex justify-center">
                        <img src={DidiTechImage} className="w-80" alt="DidiTech Logo" />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Hero