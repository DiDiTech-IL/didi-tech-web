import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa"
import DidiTechImage from "../assets/didi_tech_logo.png"
import { useEffect, useMemo, useState } from "react";
import { Typewriter } from "./typewriter";
function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["מקצועי", "פשוט", "מושקע", "שימושי", "חכם"],
        []
    );


    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div className="border-b border-neutral-900 pb-4 lg:mb-35" dir="rtl">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-sky-50 pt-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            src={DidiTechImage}
                            className="w-28 mx-auto"
                        />
                        <motion.h1
                            className="text-4xl md:text-7xl sm:text-5xl min-w-full flex flex-col lg:flex-row md:flex-col sm:flex-col justify-center items-center font-bold mb-6 bg-gradient-to-r from-teal-500 to-sky-800 font-heebo bg-clip-text text-transparent"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span>
                                הרעיון
                                <span className="font-light">&nbsp;מורכב?&nbsp;</span>
                            </span>
                            <span>
                                הפתרון&nbsp;
                                <Typewriter
                                    text={titles}
                                    speed={70}
                                    className="font-light bg-gradient-to-r from-sky-800 to-sky-700 font-heebo bg-clip-text text-transparent"
                                    waitTime={2000}
                                    deleteSpeed={70}
                                    cursorChar={"|"}
                                />
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-green-900 font-assistant mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            פיתוח מערכות מקצה-לקצה במטרה להביא ללקוחותינו מוצרים נוחים, מהירים ובטוחים לשימוש.
                        </motion.p>

                        <motion.div
                            className="flex flex-col md:flex-row items-center justify-center gap-4 md:space-y-0 md:gap-4 mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <motion.a
                                href="#פרויקטים"
                                className="bg-white text-teal-600 px-8 py-3 rounded-full font-rubik font-bold border-2 border-teal-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                פרוייקטים לדוגמה
                            </motion.a>
                            <motion.a
                                href="#צורקשר"
                                className="bg-sky-800 text-white px-8 py-3 rounded-full font-rubik font-bold flex items-center justify-center gap-2 group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>לפתרונות לעסקים וארגונים</span>
                                <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.a>

                        </motion.div>

                        <motion.div
                            className="flex justify-center gap-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            <motion.a
                                href="https://github.com/didinewlander"
                                className="text-slate-600 hover:text-slate-600 transition-colors"
                                whileHover={{ y: -2 }}
                            >
                                <FaGithub size={24} />
                            </motion.a>
                            <motion.a
                                href="https://www.linkedin.com/in/yedidyanewlander/"
                                className="text-slate-600 hover:text-blue-800 transition-colors"
                                whileHover={{ y: -2 }}
                            >
                                <FaLinkedin size={24} />
                            </motion.a>
                            <motion.a
                                href="https://www.youtube.com/@%D7%93%D7%99%D7%93%D7%99-%D7%98%D7%A7"
                                className="text-slate-600 hover:text-red-800 transition-colors"
                                whileHover={{ y: -2 }}
                            >
                                <FaYoutube size={24} />
                            </motion.a>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default Hero