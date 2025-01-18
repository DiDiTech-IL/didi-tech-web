import { motion } from 'framer-motion';
import React from 'react';

export const Testimonials: React.FC = () => {
    return (
        <section id="המלצות" className="py-20 bg-teal-50" dir="rtl">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent">לקוחות ממליצים</h2>
                    {/* <p className="text-xl text-green-900 font-assistant mb-8">
                        ביקשנו יפה, זה מה שהם ענו. לא נגענו 😉
                    </p> */}
                </motion.div>

                {/*   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            className="bg-white p-6 rounded-xl shadow-lg relative"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Quote className="w-8 h-8 text-teal-200 absolute top-6 left-6" />
                            <p className="text-slate-600 mb-6 relative z-10">{testimonial.content}</p>

                            <div className="flex items-center">
                                <img
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover ml-4"
                                />
                                <div>
                                    <h4 className="font-bold">{testimonial.name}</h4>
                                    <p className="text-sm text-slate-600">
                                        {testimonial.role} at {testimonial.company}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                 
                </div> */}
                <motion.div

                    className="p-6 w-full text-center relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >

                    <h2 className="text-4xl w-full font-bold mb-4 font-rubik text-teal-700 drop-shadow-lg">ריק פה... היו הראשונים!</h2>
                    <p className="text-gray-600 font-assistant">גללו למטה וקבעו פגישה</p>

                </motion.div>
            </div>
        </section>
    );
};