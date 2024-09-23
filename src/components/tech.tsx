import { FaReact, FaNodeJs, FaAws, FaKey } from "react-icons/fa";
import { TbBrandNextjs, TbApi } from "react-icons/tb";
import { SiMongodb, SiExpress, SiTailwindcss, SiShadcnui, SiReactquery, SiReactrouter, SiVite, SiRender, SiGooglecloud, SiOpenai, SiGodaddy, SiObsstudio } from "react-icons/si";
import { BiLogoPostgresql } from "react-icons/bi";
import { IoLogoVercel, IoLogoDocker } from "react-icons/io5";
import { DiGit, DiNpm } from "react-icons/di";

function Tech() {
    const techItems = [
        // Front End (from simple to complex)
        { Icon: FaReact, label: "React: ספריה ב-JS לבניית ממשקי משתמש", category: "Front End", color: "text-cyan-400" },
        { Icon: SiVite, label: "Vite: סביבת הרצה של אתר מבוסס ריאקט בפיתוח", category: "Front End", color: "text-purple-600" },
        { Icon: TbBrandNextjs, label: "Next.js: פריימוורק מתקדם של ריאקט עם פונקציונליות צד שרת", category: "Front End", color: "text-slate-200" },
        { Icon: SiTailwindcss, label: "Tailwind CSS: כלי לעיצוב ממשקים בפשטות", category: "Front End", color: "text-sky-500" },
        { Icon: SiReactrouter, label: "React Router: מנתב לאתרים מבוססי ריאקט", category: "Front End", color: "text-red-500" },
        { Icon: SiReactquery, label: "React Query: כלי לניהול קריאות מידע מהשרת", category: "Front End", color: "text-pink-600" },
        { Icon: SiShadcnui, label: "Shadcn/ui: ספריית קומפוננטות שימושית ביותר", category: "Front End", color: "text-slate-100" },

        // Back End (from simple to complex)
        { Icon: FaNodeJs, label: "Node.js: מנוע זמן-אמת של JS במגוון סביבות כולל שרתים", category: "Back End", color: "text-green-600" },
        { Icon: SiExpress, label: "Express: כלי לניתוב וניהול הפניות בשרת JS", category: "Back End", color: "text-slate-300" },

        // Databases (from simple to complex)
        { Icon: SiMongodb, label: "MongoDB: מסד נתונים לא-SQL", category: "Databases", color: "text-green-500" },
        { Icon: BiLogoPostgresql, label: "PostgreSQL: מסד נתונים SQL", category: "Databases", color: "text-blue-600" },

        // API (from simple to complex)
        { Icon: TbApi, label: "API: ממשקי תקשורת בין המשתמש לשרת", category: "API", color: "text-yellow-600" },
        { Icon: FaKey, label: "Authentication: אבטחה ואימות משתמשים באפליקציה", category: "API", color: "text-yellow-600" },

        // Cloud (from simple to complex)
        { Icon: IoLogoVercel, label: "Vercel: פלטפורמה להעלאת אתרים והשקה שלהם", category: "Cloud", color: "text-slate-300" },
        { Icon: SiRender, label: "Render: פלטפורמה להעלאת אתרים והשקה שלהם", category: "Cloud", color: "text-slate-200" },
        { Icon: FaAws, label: "AWS: שירותי הענן של אמזון", category: "Cloud", color: "text-orange-500" },
        { Icon: SiGooglecloud, label: "Google Cloud: כלים מהענן של גוגל (בעיקר אימות ו-API)", category: "Cloud", color: "text-blue-400" },
        { Icon: IoLogoDocker, label: "Docker: פלטפורמה להשקת סביבות מערכת מותאמות לכל מחשב", category: "Cloud", color: "text-blue-600" },

        // AI (from simple to complex)
        { Icon: SiOpenai, label: "OpenAI: קישור ל-LLM לטובת פעולות AI", category: "AI", color: "text-slate-300" },

        // DevOps (from simple to complex)
        { Icon: DiGit, label: "Git: מעקב גרסאות והתקדמות בפרויקט", category: "DevOps", color: "text-orange-600" },
        { Icon: DiNpm, label: "NPM: מאגר הספריות של Node.js", category: "DevOps", color: "text-red-600" },
        { Icon: SiGodaddy, label: "GoDaddy: שירות לרכישת דומיינים", category: "DevOps", color: "text-green-500" },
        { Icon: SiObsstudio, label: "OBS Studio: תוכנה חינמית להקלטה ושידור", category: "DevOps", color: "text-slate-50" }
    ];

    return (
        <div className="border-b border-slate-800 pb-24">
            <h1 className="my-20 text-center text-4xl font-heebo">הטכנולוגיות שמשתמשים בהן פה בדידי-טק</h1>

            {/* Flexbox for smaller screens, grid layout for larger screens */}
            <div className="flex flex-wrap justify-center gap-4 lg:hidden">
                {techItems.map(({ Icon, label, color }, index) => (
                    <div
                        key={index}
                        className="relative rounded-2xl border-4 border-slate-800 p-4 transition duration-300 ease-in-out group"
                    >
                        {/* Apply blur to the icon only */}
                        <Icon className={`text-7xl ${color} transition duration-300 ease-in-out group-hover:blur-md`} />

                        {/* Text container - no blur effect here */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                            <div className="rounded-lg bg-black bg-opacity-80 p-4 text-white text-sm">
                                {label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show category-based layout on larger screens */}
            <div className="hidden lg:flex gap-8">
                {["Front End", "Back End", "Databases", "API", "Cloud", "AI", "DevOps"].map((category) => (
                    <div key={category}>
                        <h2 className="mb-4 text-2xl font-bold">{category}</h2>
                        <div className="flex flex-wrap gap-4">
                            {techItems
                                .filter((item) => item.category === category)
                                .map(({ Icon, label, color }, index) => (
                                    <div
                                        key={index}
                                        className="relative rounded-2xl border-4 border-slate-800 p-4 transition duration-300 ease-in-out group"
                                    >
                                        {/* Apply blur to the icon only */}
                                        <Icon className={`text-7xl ${color} transition duration-300 ease-in-out group-hover:blur-md`} />

                                        {/* Text container - no blur effect here */}
                                        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
                                            <div className="rounded-lg bg-black bg-opacity-80 p-4 text-white text-sm">
                                                {label}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tech;
