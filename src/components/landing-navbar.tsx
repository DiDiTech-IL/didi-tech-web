import { motion } from 'framer-motion';
import LogoUrl from "../assets/didi_tech_logo.svg";

function Navbar() {
    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 py-4" dir="rtl">
                <nav className="flex items-center justify-between">
                    <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="flex flex-shrink-0 items-center">
                            <img src={LogoUrl} alt="Didi Tech Logo" className="mx-2 w-10" />
                        </div>
                    </motion.div>
                    <div className="hidden md:flex gap-8 font-heebo" dir="rtl">
                        {['שירותים', 'פרויקטים', 'שותפים', 'עדכונים', 'המלצות'].map((item) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-gray-600 hover:text-indigo-600 font-medium"
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.2 }}
                            >
                                {item}
                            </motion.a>
                        ))}
                    </div>
                    <motion.a
                        href="#צורקשר"
                        className="bg-teal-600 text-white px-6 py-2 rounded-full font-medium font-rubik hover:bg-sky-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        קבעו פגישה
                    </motion.a>
                </nav>
            </div>
        </motion.header>
    )
}

export default Navbar