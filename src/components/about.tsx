import { services } from "@/lib/content";
import { motion } from "framer-motion";
function About() {
    return (
        <section id="שירותים" className="py-20 bg-white" dir="rtl">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-800 to-sky-500 font-heebo bg-clip-text text-transparent mb-4">פרויקט בדידי-טק? הגעתם למקום הנכון!</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto font-assistant">
                        בדידי-טק תוכלו לקבל מגוון שירותים ייחודי שיקדמו אתכם ואת העסק שלכם
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={service.title}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="bg-sky-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                                    <Icon className="w-8 h-8 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-rubik">{service.title}</h3>
                                <p className="text-gray-600 font-assistant">{service.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    )
}

export default About