import rubberDucky from "../assets/profile.png"
function About() {
    return (
        <div className="border-b border-neutral-900 pb-4">
            <h1 className="my-20 text-center text-4xl font-heebo">
                מה זה
                <span className="text-slate-500"> דידי-טק?</span>
            </h1>
            <div className="flex flex-wrap">
                <div className="w-full lg:w-1/2 lg:p-8">
                    <div className="flex items-center justify-center">
                        <img className="rounded-2xl w-auto mb-4" src={rubberDucky} alt="This is me!" />
                    </div>
                </div>
                <div className="w-full lg:w-1/2">
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <p className="my-2 max-w-xl py-6">
                            דידי-טק הוא השם המסחרי שלי, ידידיה נוילנדר, אני מפתח ולומד ומלמד ועושה מלא דברים מגניבים כשאני עם הכובע של המתכנת.
                        </p>
                        <p className="my-2 max-w-xl py-6">
                            בגדול אני מתעסק בכל מה שנוגע לפיתוח אתרים בעיקר, אבל יש לי עוד תחומים שיצא לי לגעת בהם, סתם ככה לכיף שלי                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default About