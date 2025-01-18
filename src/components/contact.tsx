import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import React from 'react';
export const Contact: React.FC = () => {
    return (
        <section id="צורקשר" className="py-20 bg-white" dir="rtl">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent">בואו נדבר</h2>
                    <p className="text-xl text-green-900 font-assistant mb-8">
                        נקבע לנו זמן מסודר ונדבר על הכל
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex flex-grow items-start gap-4">
                            <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 font-rubik">לפניות דרך המייל (נכון לעכשיו אני אענה רק שם)</h3>
                                <a href="mailto:yedidya@didi-tech.com" className="text-gray-600 font-assistant">yedidya@didi-tech.com</a>
                            </div>
                        </div>

                        {/* <div className="flex items-start gap-4">
                            <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                                <FaWhatsapp className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-2 font-rubik">ניתן לפנות בטלפון ובווטסאפ</h3>
                                <p className="text-gray-600 font-assistant">058-4242529</p>
                            </div>
                        </div> */}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};