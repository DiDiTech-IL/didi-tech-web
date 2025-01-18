import { motion } from 'framer-motion';
import React from 'react';
import yanivArad from "@/assets/s9pnf449ee846ecba4e09a2c19366653709b8.png"
import medicode from "@/assets/D (10).png"
import lanisayon from "@/assets/D (12).png"
import smartoc from "@/assets/SmartOC (2).png"
import haargaz from "@/assets/D (13).png"
const partners = [
    {
        name: 'Medicode',
        logo: medicode,
        //link: 'https://www.medicode.co.il'
    },
    {
        name: 'הארגז',
        logo: haargaz,
    }, {
        name: 'שרייבר לב-טק',
        logo: 'https://levtech.jct.ac.il/assets/images/levtech_he_color_logo.png',
        link: 'https://levtech.jct.ac.il'
    },
    {
        name: 'Yaniv Arad - Training Labs',
        logo: yanivArad,
        link: 'https://www.yaniv-arad.com'
    },

    {
        name: 'זה לניסיון',
        logo: lanisayon,
        // link: 'https://lanisayon.co.il'
    },
    {
        name: 'SmartOC',
        logo: smartoc,
        //link: 'https://smartoc.live'
    }
];

export const Partners: React.FC = () => {
    return (
        <section id="שותפים" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent">חברים טובים באמצע הדרך</h2>
                    <p className="text-xl text-green-900 font-assistant mb-8">
                        יש פה פרויקטים שאני הרמתי, ויש פה גם אנשים שעבדתי יחד איתם
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center">
                    {partners.map((partner, index) => (
                        <motion.a
                            key={partner.name}
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[200px] h-20 relative group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="max-h-full max-w-full object-contain filter grayscale opacity-50 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                                />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};