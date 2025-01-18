import { projects } from '@/lib/content';
import { motion } from 'framer-motion';
import React from 'react';

const Projects: React.FC = () => {
    return (
        <section id="פרויקטים" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4" dir="rtl">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent">בין הפרויקטים שלנו</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="relative group">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-48 object-cover"
                                />
                                {/* <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a
                                        href={project.link}
                                        target='_blank'
                                        className="bg-white text-teal-600 font-rubik px-4 py-2 rounded-full flex items-center gap-2"
                                    >
                                        <span>לאתר הפרויקט</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div> */}
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-2 font-rubik">{project.title}</h3>
                                <p className="text-gray-600 font-assistant">{project.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;