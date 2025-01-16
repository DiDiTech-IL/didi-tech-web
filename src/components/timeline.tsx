import { motion } from 'framer-motion';
import React from 'react';

interface TimelineProject {
    title: string;
    date: string;
    description: string;
    image: string;
    tags: string[];
}

const projects: TimelineProject[] = [
    {
        title: 'יציאה לדרך',
        date: '2022-03',
        description: 'כניסה לתוך עולם הפיתוח העסקי, הדרכות תכנות ועבודה עם סטארטאפים',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1280',
        tags: ['Startup', 'Technology']
    },
    {
        title: 'מנטורינג והשתתפות בהאקתונים',
        date: '2022-07',
        description: 'הדרכה והכוונת סטודנטים וצוותי פיתוח במהלך אירועי האקתון עבור סטודנטים וקבוצות',
        image: 'https://images.unsplash.com/photo-1587556930799-8dca6fad6d41?auto=format&fit=crop&q=80&w=1280',
        tags: ['Healthcare', 'Real-time']
    },
    {
        title: 'Superducation נולדת',
        date: '2023-04',
        description: 'נועדה לאפשר לסטודנטים לרכוש ולשתף ידע באמצעות שיעורים מקוונים במחירים הוגנים ושווים לכל נפש',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1280',
        tags: ['Security', 'Enterprise']
    },
    {
        title: 'SmartOC מוזנקת למלחמת "חרבות ברזל"',
        date: '2023-10',
        description: 'בעקבות אירועים בטחוניים הקשורים בתקשורת וניהול כוחות בטחון בשטח נוצר הצורך למערכת SmartOC',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1280',
        tags: ['Communication', 'Scale']
    },
    {
        title: '"זה לניסיון" כבר לא סיסמה',
        date: '2024-04',
        description: 'פלטפורמה המאחדת כל מה שנדרש בשביל אנשים שרוצים דריסת רגל ראשונית בעולם התוכנה',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1280',
        tags: ['Cloud', 'Security']
    },
    {
        title: 'תוכנית הארגז למפתחים',
        date: '2024-07',
        description: 'תוכנית מעמיקה ומקצועית לרכישת ארגז כלים טכנולוגי לכל מה שקשור בעולם הפיתוח, החל מכתיבת קוד בסיסי ועד הפצת המערכות בענן',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1280',
        tags: ['Analytics', 'Big Data']
    }
];

export const TimelineProjects: React.FC = () => {
    return (
        <section id="עדכונים" className="py-20 bg-slate-50" dir="rtl">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent">ציר הזמן של דידי-טק</h2>
                    <p className="text-xl text-green-900 font-assistant mb-8">
                        איפה הכל התחיל, ומה התוכניות הלאה?
                    </p>
                </motion.div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-sky-200 transform md:-translate-x-1/2" />

                    {projects.map((project, index) => (
                        <motion.div
                            key={project.title}
                            className={`relative flex items-start mb-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                } flex-row`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Timeline Dot */}
                            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 flex flex-col items-center z-10">
                                <div className="w-4 h-4 rounded-full bg-sky-600 border-4 border-white" />
                                <div className="mt-2 px-4 py-1 bg-teal-600 rounded-full">
                                    <span className="text-sm text-white font-medium whitespace-nowrap">
                                        {new Date(project.date).toLocaleDateString('he-IL', {
                                            year: 'numeric',
                                            month: 'short',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className={`pl-16 md:pl-0 md:w-5/12 ${index % 2 === 0
                                    ? 'md:pr-8 md:text-right'
                                    : 'md:pl-8'
                                    } w-full`}
                            >
                                <motion.div
                                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                                    whileHover={{ y: -5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold font-rubik mb-2">{project.title}</h3>
                                        <p className="text-slate-600 font-assistant mb-4">{project.description}</p>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};